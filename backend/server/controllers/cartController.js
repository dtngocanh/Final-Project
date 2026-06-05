import User from "../models/User.js";
import Product from "../models/Product.js";
import ErrorHandler from "../utils/errorHandler.js";
import crypto from "crypto"; // Dùng để tạo mã nhóm combo ngẫu nhiên nhằm phân biệt các bộ combo với nhau

// 1. UPDATE USER CART: api/cart/update
export const updateCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { cartItems } = req.body;

    if (!cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart data!",
      });
    }

    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    const oldCartItems = currentUser.cartItems || [];

    // Đếm số lượng thành viên combo từ frontend
    const incomingComboCounts = {};
    cartItems.forEach((item) => {
      if (item.comboId) {
        incomingComboCounts[item.comboId] =
          (incomingComboCounts[item.comboId] || 0) + 1;
      }
    });

    // Đếm số lượng thành viên combo cũ trong DB
    const oldComboCounts = {};
    oldCartItems.forEach((item) => {
      if (item.comboId) {
        oldComboCounts[item.comboId] = (oldComboCounts[item.comboId] || 0) + 1;
      }
    });

    const warnings = [];
    let newTotalCart = 0;
    const finalCartItems = [];

    for (const item of cartItems) {
      const productId = item.product?._id || item.product;

      const product = await Product.findById(productId);

      // Sản phẩm đã bị xóa khỏi DB
      if (!product) {
        warnings.push(`A product in your cart no longer exists.`);
        continue;
      }

      // Chỉ cảnh báo nếu hết hàng
      if (product.stock <= 0) {
        warnings.push(`${product.name} is currently out of stock.`);
      }

      let quantity = item.quantity;

      // Nếu còn hàng nhưng quantity vượt stock thì giảm xuống
      if (product.stock > 0 && quantity > product.stock) {
        warnings.push(
          `${product.name} quantity adjusted from ${quantity} to ${product.stock}.`,
        );

        quantity = product.stock;
      }

      const oldItem = oldCartItems.find(
        (old) =>
          old.product.toString() === productId.toString() &&
          old.comboId === item.comboId,
      );

      let settledPrice = product.price;

      // Combo bị phá vỡ
      const isComboBroken =
        item.comboId &&
        (!incomingComboCounts[item.comboId] ||
          incomingComboCounts[item.comboId] < oldComboCounts[item.comboId]);

      if (isComboBroken) {
        settledPrice = product.price;
        item.comboId = undefined;
      } else if (item.price !== undefined) {
        settledPrice = item.price;
      } else if (oldItem && oldItem.price !== undefined) {
        settledPrice = oldItem.price;
      }

      newTotalCart += settledPrice * quantity;

      finalCartItems.push({
        product: productId,
        quantity,
        price: Number(settledPrice.toFixed(2)),
        comboId: item.comboId || undefined,
      });
    }

    await User.findByIdAndUpdate(userId, {
      cartItems: finalCartItems,
      total_cart: Number(newTotalCart.toFixed(2)),
    });

    const populatedUser =
      await User.findById(userId).populate("cartItems.product");

    return res.json({
      success: true,
      message: "Cart Updated",
      warnings,
      cartItems: populatedUser.cartItems,
      total_cart: populatedUser.total_cart || 0,
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET CART FOR A USER: api/cart/get
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "cartItems.product",
    );
    res.json({
      success: true,
      cartItems: user ? user.cartItems : [],
      total_cart: user ? user.total_cart || 0 : 0,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 3. ADD COMBO TO CART: api/cart/add-combo
export const addCombo = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { mainProductId, comboProductIds } = req.body;

    if (!mainProductId || !comboProductIds || !Array.isArray(comboProductIds)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid combo data!" });
    }

    const allProductIds = [mainProductId, ...comboProductIds];
    const products = await Product.find({ _id: { $in: allProductIds } });

    if (products.length !== allProductIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more products in combo not found!",
      });
    }

    for (const product of products) {
      if (product.stock < 1) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is out of stock!`,
        });
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    let currentCartItems = [...user.cartItems];

    // TẠO MỘT TOKEN ĐỊNH DANH DUY NHẤT CHO BỘ COMBO NÀY
    // Giúp phân biệt nếu khách mua nhiều bộ combo khác nhau trong giỏ hàng
    const uniqueComboId = `combo_${crypto.randomBytes(4).toString("hex")}`;

    for (const product of products) {
      const discountedPrice = Number((product.price * 0.9).toFixed(2));

      // Thêm sản phẩm mới kèm mã định danh nhóm combo vừa tạo
      currentCartItems.push({
        product: product._id,
        quantity: 1,
        price: discountedPrice,
        comboId: uniqueComboId, // Đánh dấu tất cả các món này thuộc chung 1 group combo
      });
    }

    const finalTotalCart = currentCartItems.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    await User.findByIdAndUpdate(userId, {
      cartItems: currentCartItems,
      total_cart: Number(finalTotalCart.toFixed(2)),
    });

    const populatedUserCart =
      await User.findById(userId).populate("cartItems.product");

    return res.status(200).json({
      success: true,
      message: "Combo added to cart successfully!",
      total_cart: populatedUserCart.total_cart,
      cartItems: populatedUserCart.cartItems,
    });
  } catch (error) {
    next(error);
  }
};
