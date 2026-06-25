import Stripe from "stripe";
import mongoose from "mongoose"; // 1. Import thêm mongoose
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const processStripeOrder = async (stripeSession) => {
  // 2. Khởi tạo session của MongoDB
  const session = await mongoose.startSession();
  session.startTransaction();

  const paymentIntentId = stripeSession.payment_intent || stripeSession.id;

  try {
    // CHECK DUPLICATE ORDER
    const existingOrder = await Order.findOne({
      "paymentInfo.id": paymentIntentId,
    });

    if (existingOrder) {
      await session.abortTransaction();
      session.endSession();
      return existingOrder;
    }

    const metadata = stripeSession.metadata || {};
    const userId = metadata.userId;

    const shippingInfo = {
      fullName: metadata.fullName || "N/A",
      phone: metadata.phone || "N/A",
      address: metadata.address || "N/A",
      districtId: metadata.districtId ? Number(metadata.districtId) : undefined,
      wardCode: metadata.wardCode || "",
      country: metadata.country || "Vietnam",
      provinceId: metadata.provinceId ? Number(metadata.provinceId) : 202,
    };

    const rawOrderItems = metadata.orderItems
      ? JSON.parse(metadata.orderItems)
      : [];
    const shippingPrice = Number(metadata.shippingFeeUSD || 0);
    const shippingPriceVND = Number(metadata.shippingFeeVND || 0);

    const orderItems = [];
    for (const item of rawOrderItems) {
      const productId = item.p || item.product;
      const quantity = item.q || item.quantity;

      // Tìm thông tin sản phẩm (Đính kèm session)
      const dbProduct = await Product.findById(productId).session(session);
      const price = item.pr || item.price || (dbProduct ? dbProduct.price : 0);

      orderItems.push({
        product: productId,
        quantity: quantity,
        price: price,
        name: dbProduct ? dbProduct.name : "Unknown Product",
        image:
          dbProduct && dbProduct.images?.[0]?.url
            ? dbProduct.images[0].url
            : "https://via.placeholder.com/150",
      });
    }

    // CHECK & UPDATE STOCK (Đính kèm session)
    for (const item of orderItems) {
      const product = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity, salesCount: item.quantity },
        },
        { session }, // Loại bỏ new: true để tối ưu performance
      );

      if (!product) {
        throw new Error(
          `One or more products are out of stock or insufficient.`,
        );
      }
    }

    const itemsPrice = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const totalPrice = Number((itemsPrice + shippingPrice).toFixed(2));

    // CREATE ORDER (Đính kèm session - Lưu ý: dùng mảng [] khi truyền session cho .create)
    const [order] = await Order.create(
      [
        {
          user: userId && userId !== "GUEST_USER" ? userId : null,
          orderItems,
          shippingInfo,
          paymentInfo: {
            id: paymentIntentId,
            method: "Stripe",
            status: "Paid",
            paidAt: new Date(),
          },
          itemsPrice,
          shippingPrice,
          shippingPriceVND,
          totalPrice,
          orderStatus: "Processing",
        },
      ],
      { session },
    );

    // CLEAR USER CART (Đính kèm session)
    if (userId && userId !== "GUEST_USER") {
      await User.findByIdAndUpdate(
        userId,
        { $set: { cartItems: [] } },
        { session },
      );
    }

    // 3. Nếu mọi thứ chạy tốt -> COMMIT đồng loạt
    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (error) {
    // 4. Nếu có bất kỳ lỗi nào -> HOÀN TÁC TOÀN BỘ dũ liệu kho/đơn hàng về ban đầu
    await session.abortTransaction();
    session.endSession();

    console.error("[PROCESS STRIPE ORDER ERROR]:", error);

    if (error.code === 11000) {
      console.log("Duplicate order ignored");
      return await Order.findOne({ "paymentInfo.id": paymentIntentId });
    }

    throw error;
  }
};
