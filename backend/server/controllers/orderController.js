import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Campaign from "../models/Campaign.js";

import ErrorHandler from "../utils/errorHandler.js";
import { calculateShippingFee } from "../services/ghnService.js";
import { createOrderNotification } from "../helpers/notificationHelper.js";
import mongoose from "mongoose";

// 1. PLACE ORDER COD

export const placeOrderCOD = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { orderItems, shippingInfo } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return next(new ErrorHandler("No items found in your order", 400));
    }

    let calculatedItemsPrice = 0;
    const validatedOrderItems = [];

    // DUYỆT QUA CÁC ITEM TRONG GIỎ HÀNG
    for (const item of orderItems) {
      if (!item.quantity || item.quantity <= 0) {
        throw new ErrorHandler(`${item.name} is invalid`, 400);
      }

      // Bước 1: Trừ kho sản phẩm bằng Atomic Query (CÓ kèm Session)
      // Bỏ option { new: true } để tối ưu dung lượng truyền tải, nhận về doc cũ
      const product = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity, salesCount: item.quantity },
        },
        { session },
      );

      if (!product) {
        throw new ErrorHandler(
          `Product ${item.name || ""} is out of stock or insufficient.`,
          400,
        );
      }

      // Bước 2: Tìm Campaign đang chạy
      const activeCampaign = await Campaign.findOne({
        isActive: true,
        $or: [
          { products: product._id },
          { category: product.category, targetType: "category" },
        ],
      }).session(session);

      let actualPrice = product.price;

      if (activeCampaign) {
        // TỐI ƯU RACE CONDITION CAMPAIGN: Update trực tiếp xuống DB với điều kiện chặt chẽ
        // Thay vì cộng bằng code Node.js, ta dùng Atomic update thẳng vào Campaign
        const updatedCampaign = await Campaign.findOneAndUpdate(
          {
            _id: activeCampaign._id,
            isActive: true,
            // Đảm bảo tại thời điểm update, (saleSold + số lượng mua mới) không vượt quá saleLimit
            $expr: {
              $or: [
                { $eq: ["$saleLimit", 0] }, // Không giới hạn số lượng sale
                {
                  $lte: [{ $add: ["$saleSold", item.quantity] }, "$saleLimit"],
                },
              ],
            },
          },
          {
            $inc: { saleSold: item.quantity },
          },
          { session, new: true }, // Cần lấy doc mới để check xem có cần tắt campaign không
        );

        // Nếu không update được nghĩa là lượt mua này đã làm vượt quá saleLimit (Bị chặn đứng bởi DB!)
        if (!updatedCampaign) {
          throw new ErrorHandler(
            `Sorry! The promotional price for ${product.name} has just reached its limit.`,
            400,
          );
        }

        // Tính giá sale dựa trên dữ liệu sản phẩm gốc
        actualPrice =
          product.discountPrice && product.discountPrice > 0
            ? product.discountPrice
            : product.price;

        // Tự động tắt chiến dịch và xóa giá giảm nếu đạt đỉnh giới hạn lượng bán
        if (
          updatedCampaign.saleLimit > 0 &&
          updatedCampaign.saleSold >= updatedCampaign.saleLimit
        ) {
          await Campaign.updateOne(
            { _id: updatedCampaign._id },
            { $set: { isActive: false } },
            { session },
          );
          await Product.updateOne(
            { _id: product._id },
            { $set: { discountPrice: 0 } },
            { session },
          );
        }
      }

      const itemTotal = actualPrice * item.quantity;
      calculatedItemsPrice += itemTotal;

      validatedOrderItems.push({
        product: product._id,
        name: product.name,
        price: Number(actualPrice.toFixed(2)),
        quantity: item.quantity,
        image: product.images?.[0]?.url || "",
        shelfLifeDays: product.shelfLifeDays || 7,
      });
    }

    // TÍNH PHÍ VẬN CHUYỂN
    const shippingRs = await calculateShippingFee({
      cartItems: validatedOrderItems,
      to_district_id: shippingInfo.districtId,
      to_ward_code: shippingInfo.wardCode,
    });

    const shippingPrice = shippingRs.feeUSD;
    const totalPrice = calculatedItemsPrice + shippingPrice;

    // TẠO ĐƠN HÀNG MỚI (Nằm trong Transaction)
    const order = await Order.create(
      [
        {
          user: userId,
          orderItems: validatedOrderItems,
          shippingInfo,
          paymentInfo: { method: "COD", status: "Pending" },
          itemsPrice: Number(calculatedItemsPrice.toFixed(2)),
          shippingPrice,
          totalPrice: Number(totalPrice.toFixed(2)),
          orderStatus: "Processing",
        },
      ],
      { session },
    );

    // XÓA GIỎ HÀNG
    if (userId && userId !== "GUEST_USER") {
      await User.findByIdAndUpdate(
        userId,
        { $set: { cartItems: [] } },
        { session },
      );
    }

    // NẾU TẤT CẢ THÀNH CÔNG -> COMMIT ĐỒNG LOẠT
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Order placed successfully with Cash on Delivery",
      order: order[0], // Lưu ý: Order.create kèm session sẽ trả về một Array
    });
  } catch (error) {
    // NẾU GẶP BẤT KỲ LỖI GÌ -> HỦY BỎ TOÀN BỘ (Database tự động hoàn kho, hoàn campaign)
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
// =========================================================================
// 2. GET USER ORDERS
// =========================================================================
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("orderItems.product", "name images price stock");

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================================
// 3. CANCEL ORDER (Khách hủy đơn - Hoàn trả suất sale)
// =========================================================================
export const cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const userId = req.user._id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (order.user.toString() !== userId.toString()) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (order.orderStatus !== "Processing") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel this order",
      });
    }

    if (
      order.paymentInfo.method === "Stripe" &&
      order.paymentInfo.status === "Paid"
    ) {
      const paymentIntentId = order.paymentInfo.id;

      if (!paymentIntentId) {
        return next(new ErrorHandler("Not found Payment Intent ID", 400));
      }

      await stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason: "requested_by_customer",
      });

      order.paymentInfo.status = "Refunded";
    }
    const updateProductOps = order.orderItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: {
            stock: item.quantity,
            salesCount: -item.quantity,
          },
        },
      },
    }));

    await Product.bulkWrite(updateProductOps);

    // HOÀN SUẤT SALE LẠI CHO CAMPAIGN KHI KHÁCH TỰ HỦY ĐƠN
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        const campaign = await Campaign.findOne({
          $or: [
            { products: product._id },
            { category: product.category, targetType: "category" },
          ],
        });

        if (campaign) {
          campaign.saleSold = Math.max(
            0,
            (campaign.saleSold || 0) - item.quantity,
          );

          // NẾU MỞ LẠI CHIẾN DỊCH VÌ ĐÃ CÓ SUẤT TRỐNG
          if (
            campaign.saleLimit > 0 &&
            campaign.saleSold < campaign.saleLimit
          ) {
            campaign.isActive = true;

            // LƯU Ý: Nếu Campaign của bạn có lưu thông tin giảm giá (ví dụ campaign.discountPercentage)
            // Bạn nên khôi phục discountPrice ở đây để Frontend hiển thị lại giá giảm:
            // const restoredDiscount = product.price - (product.price * campaign.discountPercentage / 100);
            // await Product.findByIdAndUpdate(product._id, { $set: { discountPrice: restoredDiscount } });
          }
          await campaign.save();
        }
      }
    }

    order.orderStatus = "Canceled";
    await order.save();
    res.status(200).json({ success: true, message: "Order canceled" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 4. GET ALL ORDERS (Dành cho Admin quản lý)
// =========================================================================
export const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const statusFilter = req.query.status;
    const searchFilter = req.query.search;

    let queryCondition = {};

    if (statusFilter && statusFilter !== "All") {
      queryCondition.orderStatus = statusFilter;
    }

    if (searchFilter) {
      queryCondition.$or = [
        {
          _id: mongoose.isValidObjectId(searchFilter)
            ? searchFilter
            : undefined,
        },
        { "shippingInfo.fullName": { $regex: searchFilter, $options: "i" } },
      ].filter((condition) => Object.values(condition)[0] !== undefined);
    }

    const [totalOrders, orders, revenueAggregation, statusAggregation] =
      await Promise.all([
        Order.countDocuments(queryCondition),

        Order.find(queryCondition)
          .populate("user", "name email")
          .populate({
            path: "orderItems.product",
            select: "name price images stock",
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        Order.aggregate([
          { $match: { orderStatus: { $ne: "Canceled" } } },
          { $group: { _id: null, totalAmount: { $sum: "$totalPrice" } } },
        ]),

        Order.aggregate([
          { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
        ]),
      ]);

    const totalPages = Math.ceil(totalOrders / limit);
    const totalRevenue = revenueAggregation[0]?.totalAmount || 0;

    const ordersByStatus = statusAggregation.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    for (let i = 0; i < orders.length; i++) {
      if (!orders[i].user)
        orders[i].user = { name: "Người dùng đã bị xóa", email: "N/A" };
      if (orders[i].orderItems) {
        for (let j = 0; j < orders[i].orderItems.length; j++) {
          if (!orders[i].orderItems[j].product) {
            orders[i].orderItems[j].product = {
              name: "Sản phẩm đã bị xóa",
              price: 0,
              images: [],
            };
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      totalOrders,
      totalRevenue,
      ordersByStatus,
      totalPages,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 5. GET ORDER DETAILS
// =========================================================================
export const getOrderDetails = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("orderItems.product", "name images price stock shelfLifeDays");

    if (!order) {
      return next(new ErrorHandler("No Order found with this ID", 404));
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 6. UPDATE ORDER STATUS (Admin duyệt đơn/Hủy đơn admin)
// =========================================================================
export const updateOrder = async (req, res, next) => {
  try {
    const newStatus = req.body.status;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("No Order found with this ID", 404));
    }

    if (order.orderStatus === "Delivered") {
      return next(
        new ErrorHandler("You have already delivered this order", 400),
      );
    }

    if (order.orderStatus === "Canceled") {
      return next(
        new ErrorHandler("This order has already been canceled", 400),
      );
    }

    if (newStatus === "Canceled") {
      const updateProductOps = order.orderItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: {
            $inc: { stock: item.quantity, salesCount: -item.quantity },
          },
        },
      }));
      await Product.bulkWrite(updateProductOps);

      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          const campaign = await Campaign.findOne({
            $or: [
              { products: product._id },
              { category: product.category, targetType: "category" },
            ],
          });

          if (campaign) {
            campaign.saleSold = Math.max(
              0,
              (campaign.saleSold || 0) - item.quantity,
            );

            // NẾU MỞ LẠI CHIẾN DỊCH VÌ ĐÃ CÓ SUẤT TRỐNG
            if (
              campaign.saleLimit > 0 &&
              campaign.saleSold < campaign.saleLimit
            ) {
              campaign.isActive = true;

              // LƯU Ý TƯƠNG TỰ: Khôi phục lại discountPrice nếu có thể
              // const restoredDiscount = product.price - (product.price * campaign.discountPercentage / 100);
              // await Product.findByIdAndUpdate(product._id, { $set: { discountPrice: restoredDiscount } });
            }
            await campaign.save();
          }
        }
      }
    }

    order.orderStatus = newStatus;

    if (newStatus === "Shipped") {
      // Logic gửi email nếu cần
    }

    if (newStatus === "Delivered") {
      order.deliveredAt = Date.now();
      if (order.paymentInfo.method === "COD") {
        order.paymentInfo.status = "Paid";
        order.paymentInfo.paidAt = Date.now();
      }
    }

    await order.save({ validateBeforeSave: false });

    await createOrderNotification(order, newStatus);

    res.status(200).json({
      success: true,
      message: `Order status updated to ${newStatus}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 7. GET USER SPENDING ANALYTICS
// =========================================================================
export const getUserSpendingAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Order.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          orderStatus: "Delivered",
        },
      },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$totalPrice" },
          totalSaved: { $sum: { $multiply: ["$totalPrice", 0.1] } },
          totalItemsCount: { $sum: "$orderItems.quantity" },

          allBoughtProducts: {
            $push: {
              productId: "$orderItems.product",
              name: "$orderItems.name",
              image: "$orderItems.image",
              quantity: "$orderItems.quantity",
            },
          },
        },
      },
    ]);

    if (stats.length === 0) {
      return res.status(200).json({
        success: true,
        analytics: {
          totalSpent: 0,
          totalSaved: 0,
          totalItemsCount: 0,
          favoriteProduct: null,
        },
      });
    }

    const data = stats[0];

    const productMap = {};
    data.allBoughtProducts.forEach((p) => {
      if (!productMap[p.productId]) {
        productMap[p.productId] = { name: p.name, image: p.image, quantity: 0 };
      }
      productMap[p.productId].quantity += p.quantity;
    });

    let favoriteProduct = null;
    let maxQty = 0;
    Object.values(productMap).forEach((p) => {
      if (p.quantity > maxQty) {
        maxQty = p.quantity;
        favoriteProduct = p;
      }
    });

    res.status(200).json({
      success: true,
      analytics: {
        totalSpent: data.totalSpent,
        totalSaved: data.totalSaved,
        totalItemsCount: data.totalItemsCount,
        favoriteProduct,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
