import Stripe from "stripe";

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const processStripeOrder = async (session) => {
  try {
    // Payment Intent ID
    const paymentIntentId = session.payment_intent || session.id;

    // CHECK DUPLICATE ORDER
    const existingOrder = await Order.findOne({
      "paymentInfo.id": paymentIntentId,
    });

    if (existingOrder) {
      return existingOrder;
    }

    // GET METADATA
    const userId = session.metadata.userId;
    const shippingInfo = JSON.parse(session.metadata.shippingInfo);
    
    // Mảng orderItems tối giản được lấy từ Stripe metadata (chỉ gồm: product, price, quantity)
    const minimalistOrderItems = JSON.parse(session.metadata.orderItems);

    const shippingPrice = Number(session.metadata.shippingFeeUSD || 0);
    const shippingPriceVND = Number(session.metadata.shippingFeeVND || 0);

    // GET LINE ITEMS FROM STRIPE
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

    // =================================================================
    // FIX: TỰ ĐỘNG BÙ ĐẮP DỮ LIỆU 'NAME' VÀ 'IMAGE' TỪ DATABASE
    // Do metadata bị giới hạn ký tự nên đã phải loại bỏ name/image từ trước khi gửi lên Stripe
    // =================================================================
    const orderItems = [];
    for (const item of minimalistOrderItems) {
      const dbProduct = await Product.findById(item.product);
      
      orderItems.push({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        // Điền lại dữ liệu chuẩn từ DB để lưu vào Model Order
        name: dbProduct ? dbProduct.name : "Unknown Product",
        image: dbProduct && dbProduct.images?.[0]?.url ? dbProduct.images[0].url : "https://via.placeholder.com/150"
      });
    }
    // =================================================================

    // CALCULATE ITEMS PRICE
    const itemsPrice = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    // TOTAL PRICE
    const totalPrice = Number((itemsPrice + shippingPrice).toFixed(2));

    // CREATE ORDER
    const order = await Order.create({
      user: userId && userId !== "GUEST_USER" ? userId : null,

      orderItems, // Mảng orderItems đã được phục hồi đầy đủ name và image chuẩn

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
    });

    // UPDATE STOCK
    const updateProductOps = orderItems.map((item) => ({
      updateOne: {
        filter: {
          _id: item.product,
        },

        update: {
          $inc: {
            stock: -item.quantity,

            salesCount: item.quantity,
          },
        },
      },
    }));

    await Product.bulkWrite(updateProductOps);

    // CLEAR USER CART
    if (userId && userId !== "GUEST_USER") {
      await User.findByIdAndUpdate(userId, {
        $set: {
          cartItems: [],
        },
      });
    }

    return order;
  } catch (error) {
    console.error("[PROCESS STRIPE ORDER ERROR]:", error);
    throw error;
  }
};