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

    const metadata = session.metadata || {};

    // 1. GET METADATA ( userId )
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

    // 3. AN TOÀN CHO ORDER ITEMS
    const rawOrderItems = metadata.orderItems
      ? JSON.parse(metadata.orderItems)
      : [];

    const shippingPrice = Number(metadata.shippingFeeUSD || 0);
    const shippingPriceVND = Number(metadata.shippingFeeVND || 0);

    // GET LINE ITEMS FROM STRIPE
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

    const orderItems = [];
    for (const item of rawOrderItems) {
      const productId = item.p || item.product;
      const quantity = item.q || item.quantity;

      const dbProduct = await Product.findById(productId);
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
    // CHECK & UPDATE STOCK
    for (const item of orderItems) {
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
          new: true,
        },
      );

      if (!product) {
        throw new Error(
          `One or more products are out of stock or insuficient.`,
        );
      }
    }

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
    });
    
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
