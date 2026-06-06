import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

import ErrorHandler from "../utils/errorHandler.js";
import { calculateShippingFee } from "../services/ghnService.js";
import { createOrderNotification } from "../helpers/notificationHelper.js";
import mongoose from "mongoose";

export const placeOrderCOD = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { orderItems, shippingInfo } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return next(new ErrorHandler("No items found in your order", 400));
    }

    let calculatedItemsPrice = 0;
    const validatedOrderItems = [];

    // CHECK & UPDATE STOCK
    for (const item of orderItems) {
      if (!item.quantity || item.quantity <= 0) {
        return next(
          new ErrorHandler(`${item.name} is invalid`, 400),
        );
      }
      const product = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.quantity },
        },
        {
          $inc: {
            stock: -item.quantity,
            salesCount: item.quantity,
          },
        },
        {
          new: true, // doc after updating
        },
      );

      if (!product) {
        return next(
          new ErrorHandler(
            "Some items in your cart are out of stock or insufficient.",
            400,
          ),
        );
      }

      const itemTotal = product.price * item.quantity;
      calculatedItemsPrice += itemTotal;

      validatedOrderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0]?.url || "",
      });
    }
    // 4. TÍNH PHÍ VẬN CHUYỂN
    const shippingRs = await calculateShippingFee({
      cartItems: validatedOrderItems,
      to_district_id: shippingInfo.districtId,
      to_ward_code: shippingInfo.wardCode,
    });

    const shippingPrice = shippingRs.feeUSD;
    const totalPrice = calculatedItemsPrice + shippingPrice;

    // 5. TẠO ĐƠN HÀNG MỚI
    const order = await Order.create({
      user: userId,
      orderItems: validatedOrderItems,
      shippingInfo,
      paymentInfo: {
        method: "COD",
        status: "Pending",
      },
      itemsPrice: calculatedItemsPrice,
      shippingPrice,
      totalPrice,
      orderStatus: "Processing",
    });

    // 6. XÓA GIỎ HÀNG NẾU LÀ USER ĐĂNG NHẬP
    if (userId && userId !== "GUEST_USER") {
      await User.findByIdAndUpdate(userId, { $set: { cartItems: [] } });
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully with Cash on Delivery",
      order,
    });
  } catch (error) {
    next(error);
  }
};

// get orders for user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id; // Middleware truyền vào
    // console.log(userId);

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

    order.orderStatus = "Canceled";
    await order.save();
    res.status(200).json({ success: true, message: "Order canceled" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [GET] api/orders
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

    const [totalOrders, orders] = await Promise.all([
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
    ]);

    const totalPages = Math.ceil(totalOrders / limit);

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

    return res.status(200).json({
      success: true,
      count: orders.length,
      totalOrders,
      totalPages,
      currentPage: page,
      orders,
      message: "Fetched orders successfully!",
    });
  } catch (error) {
    console.error("Lỗi phân trang tại getAllOrders:", error.message);
    next(error);
  }
};
/**
 * @route [GET] api/order/:id
 * @description Get single order details
 */
export const getOrderDetails = async (req, res, next) => {
  try {
    // Populate 'user'
    // Populate 'orderItems.product'
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("orderItems.product", "name images price stock");

    if (!order) {
      return next(new ErrorHandler("No Order found with this ID", 404));
    }

    const userId = req.user._id;
    // const userRole = req.user.role;

    // if (userRole !== "admin" && order.user._id.toString() !== userId.toString()) {
    //   return next(new ErrorHandler("You are not authorized to view this order", 401));
    // }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    const newStatus = req.body.status;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("No Order found with this ID", 404));
    }

    // 1. Nếu đơn hàng ĐÃ GIAO thì KHÔNG ĐƯỢC THAY ĐỔI TRẠNG THÁI NỮA
    if (order.orderStatus === "Delivered") {
      return next(
        new ErrorHandler("You have already delivered this order", 400),
      );
    }

    // 2. CHẶN SPAM: Nếu đơn hàng vốn dĩ ĐÃ HỦY RỒI thì không cho cập nhật gì nữa hết
    if (order.orderStatus === "Canceled") {
      return next(
        new ErrorHandler("This order has already been canceled", 400),
      );
    }

    // 3. LOGIC HOÀN KHO: Chỉ hoàn kho khi trạng thái MỚI là Canceled
    // VÀ trạng thái CŨ chưa từng là Canceled (Đoạn check ở trên đã đảm bảo điều này)
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
    }

    // 4. LOGIC TRỪ KHO NGƯỢC LẠI (Nếu cần):
    // Nếu đơn hàng đang từ "Canceled" mà chuyển về trạng thái khác thì phải trừ kho.
    // Tuy nhiên ở bước 2 mình đã chặn không cho chuyển từ Canceled đi đâu rồi nên không lo nữa.

    // Cập nhật các thay đổi vào object 'order'
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

    // Chốt hạ lưu vào DB
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
