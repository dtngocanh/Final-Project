import Stripe from "stripe";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Campaign from "../models/Campaign.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const processStripeOrder = async (stripeSession) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const paymentIntentId = stripeSession.payment_intent || stripeSession.id;

  try {
    // 1. Kiểm tra đơn hàng trùng lặp (Idempotency Check)
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

    // 2. XỬ LÝ CHI TIẾT TỪNG SẢN PHẨM TRONG ĐƠN HÀNG
    for (const item of rawOrderItems) {
      // Ép kiểu hoặc lấy key viết tắt một cách an toàn
      const productId = item.p || item.product || item._id;
      const quantity = Number(item.q || item.quantity || 1);

      if (!productId) {
        throw new Error(
          "Missing product ID in Stripe metadata item structure.",
        );
      }

      // Lấy thông tin sản phẩm từ DB (Đính kèm session)
      const dbProduct = await Product.findById(productId).session(session);
      if (!dbProduct) {
        throw new Error(`Product with ID ${productId} not found in database.`);
      }

      // --- Bước A: Cập nhật giảm kho (Atomic Update) ---
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity, salesCount: quantity } },
        { session },
      );
      if (!updatedProduct) {
        throw new Error(
          `Product ${dbProduct.name} is out of stock or insufficient.`,
        );
      }

      // --- Bước B: Kiểm tra và cập nhật chiến dịch (Sử dụng ID chuẩn hóa từ DB) ---
      const activeCampaign = await Campaign.findOne({
        isActive: true,
        $or: [
          { products: dbProduct._id }, // Đồng bộ tuyệt đối bằng ObjectId từ DB, không dùng String từ metadata
          { category: dbProduct.category, targetType: "category" },
        ],
      }).session(session);

      // Lấy giá: Ưu tiên giá truyền từ Stripe metadata (nếu có), không thì lấy giá gốc sản phẩm
      let price = item.pr || item.price || dbProduct.price;

      if (activeCampaign) {
        const updatedCampaign = await Campaign.findOneAndUpdate(
          {
            _id: activeCampaign._id,
            isActive: true,
            $expr: {
              $or: [
                { $eq: ["$saleLimit", 0] },
                { $lte: [{ $add: ["$saleSold", quantity] }, "$saleLimit"] },
              ],
            },
          },
          { $inc: { saleSold: quantity } },
          { session, new: true },
        );

        if (!updatedCampaign) {
          throw new Error(
            `The promotional price for ${dbProduct.name} has just reached its limit.`,
          );
        }

        // Cập nhật lại giá dựa trên chiến dịch đang chạy thực tế
        price =
          dbProduct.discountPrice && dbProduct.discountPrice > 0
            ? dbProduct.discountPrice
            : dbProduct.price;

        // Tự động đóng chiến dịch nếu chạm đỉnh saleLimit
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
            { _id: dbProduct._id },
            { $set: { discountPrice: 0 } },
            { session },
          );
        }
      }

      orderItems.push({
        product: dbProduct._id, 
        quantity,
        price: Number(price.toFixed(2)),
        name: dbProduct.name,
        image: dbProduct.images?.[0]?.url || "https://via.placeholder.com/150",
      });
    }

    const itemsPrice = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const totalPrice = Number((itemsPrice + shippingPrice).toFixed(2));

    // 3. Khởi tạo bản ghi đơn hàng mới
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

    // 4. Làm sạch giỏ hàng của người dùng
    if (userId && userId !== "GUEST_USER") {
      await User.findByIdAndUpdate(
        userId,
        { $set: { cartItems: [] } },
        { session },
      );
    }

    // Xác nhận và lưu trữ vĩnh viễn mọi thay đổi dữ liệu
    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (error) {
    // Hoàn tác (Rollback) toàn bộ thao tác nếu xảy ra bất kỳ sự cố nào
    await session.abortTransaction();
    session.endSession();

    console.error("[PROCESS STRIPE ORDER ERROR]:", error);

    if (error.code === 11000) {
      return await Order.findOne({ "paymentInfo.id": paymentIntentId });
    }

    throw error;
  }
};
