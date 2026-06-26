import User from "../models/User.js";
import Product from "../models/Product.js";
import ErrorHandler from "../utils/errorHandler.js";
import crypto from "crypto"; // Dùng để tạo mã nhóm combo ngẫu nhiên nhằm phân biệt các bộ combo với nhau

// =========================================================================
// 1. UPDATE USER CART: api/cart/update
// =========================================================================
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

      // TỰ ĐỘNG CHECK GIÁ FLASH SALE THỜI GIAN THỰC CHO SẢN PHẨM THƯỜNG
      const currentLivePrice =
        product.discountPrice && product.discountPrice > 0
          ? product.discountPrice
          : product.price;

      let settledPrice = currentLivePrice;

      // Combo bị phá vỡ
      const isComboBroken =
        item.comboId &&
        (!incomingComboCounts[item.comboId] ||
          incomingComboCounts[item.comboId] < oldComboCounts[item.comboId]);

      if (isComboBroken) {
        settledPrice = currentLivePrice; // Quay về giá flash sale hiện hành (hoặc giá gốc)
        item.comboId = undefined;
      } else if (item.price !== undefined) {
        settledPrice = item.price;
      } else if (oldItem && oldItem.price !== undefined) {
        settledPrice = oldItem.price;
      } else {
        settledPrice = currentLivePrice;
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

// =========================================================================
// 2. GET CART FOR A USER: api/cart/get
// =========================================================================
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

// =========================================================================
// 3. ADD COMBO TO CART: api/cart/add-combo
// =========================================================================
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
    const uniqueComboId = `combo_${crypto.randomBytes(4).toString("hex")}`;

    for (const product of products) {
      const price = Number(product.price || 0);
      const inputDiscountPrice = Number(product.discountPrice || 0);

      let finalPrice = price;

      // 1. Nếu có nhập giá giảm và giá giảm đó hợp lệ (nhỏ hơn giá gốc)
      if (inputDiscountPrice > 0 && inputDiscountPrice < price) {
        // Tính tỷ lệ phần trăm giảm giá thực tế của sản phẩm nhập vào
        const actualDiscountPercent =
          ((price - inputDiscountPrice) / price) * 100;

        if (actualDiscountPercent < 10) {
          // NẾU GIẢM ÍT HƠN 10%: Tự động ép về mức giảm 10% theo combo
          finalPrice = price * 0.9;
        } else {
          // Nếu giảm từ 10% trở lên thì giữ nguyên giá giảm của sản phẩm
          finalPrice = inputDiscountPrice;
        }
      } else {
        // 2. Trường hợp không có giá giảm, tự động tính giảm 10% theo combo (hoặc giữ nguyên giá gốc tùy bạn)
        // Nếu không giảm, bạn đổi thành finalPrice = price;
        finalPrice = price * 0.9;
      }

      const discountedPrice = Number(finalPrice.toFixed(2));

      currentCartItems.push({
        product: product._id,
        quantity: 1,
        price: discountedPrice,
        comboId: uniqueComboId,
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

// =========================================================================
// 4. BULK ADD TO CART: api/cart/bulk-add
// =========================================================================
export const bulkAddCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid items" });
    }

    const user = await User.findById(userId);
    const cart = user.cartItems || [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const existing = cart.find(
        (c) => c.product.toString() === item.productId,
      );

      // TỰ ĐỘNG CHECK GIÁ FLASH SALE KHI THÊM HÀNG LOẠT
      const currentPrice =
        product.discountPrice && product.discountPrice > 0
          ? product.discountPrice
          : product.price;

      const qty = Math.min(item.quantity, product.stock);

      if (existing) {
        existing.quantity += qty;
        existing.price = Number(currentPrice.toFixed(2)); // Đồng bộ giá sale mới nhất
      } else {
        cart.push({
          product: item.productId,
          quantity: qty,
          price: Number(currentPrice.toFixed(2)),
        });
      }
    }

    user.cartItems = cart;
    user.total_cart = calculateCartTotal(cart); // Tính lại tổng tiền chuẩn chỉnh
    await user.save();

    const populated = await user.populate("cartItems.product");

    res.json({
      success: true,
      cartItems: populated.cartItems,
      total_cart: user.total_cart,
    });
  } catch (err) {
    next(err);
  }
};

// =========================================================================
// 5. ADD SINGLE PRODUCT TO CART: api/cart/add
// =========================================================================
export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available",
      });
    }

    const cart = user.cartItems || [];
    const existing = cart.find((i) => i.product.toString() === productId);
    const qty = Math.min(quantity, product.stock);

    // TỰ ĐỘNG KIỂM TRA XEM CÓ GIÁ FLASH SALE NGẦM KHÔNG
    const currentPrice =
      product.discountPrice && product.discountPrice > 0
        ? product.discountPrice
        : product.price;

    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.stock);
      existing.price = Number(currentPrice.toFixed(2)); // Cập nhật sang giá sale nếu sản phẩm vừa bước vào khung giờ vàng
    } else {
      cart.push({
        product: productId,
        quantity: qty,
        price: Number(currentPrice.toFixed(2)), // Đẩy giá sale thực tế vào Document Item
      });
    }

    user.cartItems = cart;
    user.total_cart = calculateCartTotal(cart);

    await user.save();

    const populated = await user.populate("cartItems.product");

    res.json({
      success: true,
      cartItems: populated.cartItems,
      total_cart: user.total_cart,
    });
  } catch (err) {
    next(err);
  }
};

// =========================================================================
// 6. REMOVE PRODUCT FROM CART
// =========================================================================
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    const user = await User.findById(userId);

    // 1. Kiểm tra xem nó có nằm trong combo không
    const targetItem = user.cartItems.find(
      (i) => i.product.toString() === productId.toString(),
    );

    // 2. Tiến hành rã nhóm combo
    if (targetItem && targetItem.comboId) {
      const brokenComboId = targetItem.comboId;

      for (let item of user.cartItems) {
        if (item.comboId === brokenComboId) {
          const prodInfo = await Product.findById(item.product);
          item.price =
            prodInfo.discountPrice && prodInfo.discountPrice > 0
              ? prodInfo.discountPrice
              : prodInfo.price;
          item.comboId = undefined;
        }
      }
    }

    user.cartItems = user.cartItems.filter((item) => {
      const itemProductId = item.product._id ? item.product._id : item.product;
      return !itemProductId.equals(productId);
    });

    user.total_cart = calculateCartTotal(user.cartItems);
    await user.save();

    const populated = await user.populate("cartItems.product");
    res.json({
      success: true,
      cartItems: populated.cartItems,
      total_cart: user.total_cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 7. UPDATE QUANTITY (PLUS/MINUS BUTTON)
// =========================================================================
export const updateQty = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, change } = req.body;

    const user = await User.findById(userId);

    const item = user.cartItems.find((i) => {
      const itemProductId = i.product._id ? i.product._id : i.product;
      return itemProductId.equals(productId);
    });

    if (!item)
      return res.status(404).json({ message: "Product not found in cart" });

    item.quantity += change;

    if (item.quantity <= 0) {
      const targetItem = user.cartItems.find(
        (i) => i.product.toString() === productId.toString(),
      );

      if (targetItem && targetItem.comboId) {
        const brokenComboId = targetItem.comboId;

        for (let item of user.cartItems) {
          if (item.comboId === brokenComboId) {
            const prodInfo = await Product.findById(item.product);
            item.price =
              prodInfo.discountPrice && prodInfo.discountPrice > 0
                ? prodInfo.discountPrice
                : prodInfo.price;
            item.comboId = undefined;
          }
        }
      }

      user.cartItems = user.cartItems.filter((i) => {
        const itemProductId = i.product._id ? i.product._id : i.product;
        return !itemProductId.equals(productId);
      });
    }

    user.total_cart = calculateCartTotal(user.cartItems);

    await user.save();

    const populated = await user.populate("cartItems.product");
    res.json({
      success: true,
      cartItems: populated.cartItems,
      total_cart: user.total_cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 8. CLEAR ENTIRE CART
// =========================================================================
export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cartItems = [];
    user.total_cart = 0;
    await user.save();

    res.json({ success: true, cartItems: [], total_cart: 0 });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// =========================================================================
// HELPER FUNCTION: CALCULATE TOTAL AMOUNT
// =========================================================================
const calculateCartTotal = (cart) => {
  return cart.reduce((total, item) => total + item.quantity * item.price, 0);
};
