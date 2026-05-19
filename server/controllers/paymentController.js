import Stripe from "stripe";
import Order from "../models/Order.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { orderItems, shippingInfo } = req.body;

    const userId = req.user ? req.user._id.toString() : "GUEST_USER";

    // console.log("1. Create Session for userId:", userId);

    const line_items = orderItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
          metadata: {
            productId: item.product.toString(),
          },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const compactItems = orderItems.map((item) => ({
      product: item.product.toString(),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      mode: "payment",
      line_items,
      customer_email: shippingInfo.email || undefined,
      metadata: {
        userId: userId,
        shippingInfo: JSON.stringify({
          fullName: shippingInfo.fullName,
          address: shippingInfo.address,
          city: shippingInfo.city,
          country: shippingInfo.country || "Vietnam",
          phone: shippingInfo.phone,
          provinceId: shippingInfo.provinceId,
          districtId: shippingInfo.districtId,
          wardCode: shippingInfo.wardCode,
        }),
      },
    });

    res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("STRIPE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const confirmOrderPayment = async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    // 1. Lấy thông tin chi tiết từ Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Payment not verified" });
    }

    const paymentIntentId = session.payment_intent;

    // 2. Kiểm tra xem đơn hàng này đã được tạo trước đó chưa
    const existingOrder = await Order.findOne({
      "paymentInfo.id": paymentIntentId,
    });
    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: "Payment already confirmed & processed",
        order: existingOrder,
      });
    }

    // 3. Lấy dữ liệu từ metadata ra để chuẩn bị ghi vào DB
    const userId = session.metadata.userId;
    const shippingInfo = JSON.parse(session.metadata.shippingInfo);
    const orderItems = JSON.parse(session.metadata.orderItems);

    const itemsPrice = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    // 4. Tạo đơn hàng CHÍNH THỨC
    const order = await Order.create({
      user: userId === "GUEST_USER" ? undefined : userId,
      orderItems,
      shippingInfo,
      paymentInfo: {
        id: paymentIntentId, // Lưu thẳng mã pi_... từ đầu
        method: "Stripe",
        status: "Paid",
        paidAt: new Date(),
      },
      itemsPrice,
      totalPrice: itemsPrice, // Tùy biến cộng thêm shippingPrice của bạn nếu có
      orderStatus: "Processing",
    });

    // 5. Trực tiếp TRỪ KHO tại đây
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

    // 6. Xóa giỏ hàng của User
    if (userId && userId !== "GUEST_USER") {
      await User.findByIdAndUpdate(userId, { $set: { cartItems: [] } });
    }

    res.status(201).json({
      success: true,
      message: "Payment confirmed and order placed successfully",
      order,
    });
  } catch (error) {
    console.error("CONFIRM PAYMENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

