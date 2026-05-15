import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

import ErrorHandler from "../utils/errorHandler.js";

export const placeOrderCOD = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const { orderItems, shippingInfo, itemsPrice, shippingPrice, totalPrice } =
      req.body;

    if (!orderItems || orderItems.length === 0) {
      return next(new ErrorHandler("No items found in your order", 400));
    }

    const order = await Order.create({
      user: userId,
      orderItems,
      shippingInfo,
      paymentInfo: {
        method: "COD",
        status: "Pending",
        // paidAt: bỏ trống, sẽ cập nhật khi giao hàng thành công
      },
      itemsPrice,
      shippingPrice,
      totalPrice,
      orderStatus: "Processing",
    });

    const updateProductOps = orderItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: {
            stock: -item.quantity,
            salesCount: item.quantity,
          },
        },
      },
    }));

    await Product.bulkWrite(updateProductOps);

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

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

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

export const cancelOrder = async (req, res) => {
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
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return next(new ErrorHandler("No orders found!", 404));
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
      message: "Fetched orders successfully!",
    });
  } catch (error) {
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
    // 1. Lấy newStatus lên đầu tiên để các dòng dưới có cái mà dùng
    const newStatus = req.body.status;
    
    // 2. Tìm order trước để kiểm tra logic
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("No Order found with this ID", 404));
    }

    // 3. Kiểm tra nếu đơn hàng đã giao rồi thì chặn
    if (order.orderStatus === "Delivered") {
      return next(new ErrorHandler("You have already delivered this order", 400));
    }

    // 4. Cập nhật các thay đổi vào object 'order' (nhưng chưa lưu vào DB)
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

    // 5. CHỐT HẠ: Lưu lại. 
    // Thêm { validateBeforeSave: false } để "né" mấy cái lỗi thiếu tỉnh/huyện ở dữ liệu cũ
    await order.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `Order status updated to ${newStatus}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};