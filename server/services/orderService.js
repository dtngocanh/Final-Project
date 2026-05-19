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
      //   console.log("Order already exists");

      return existingOrder;
    }

    // GET METADATA
    const userId = session.metadata.userId;

    const shippingInfo = JSON.parse(session.metadata.shippingInfo);

    const orderItems = JSON.parse(session.metadata.orderItems);

    const shippingPrice = Number(session.metadata.shippingFeeUSD || 0);

    const shippingPriceVND = Number(session.metadata.shippingFeeVND || 0);

    // GET LINE ITEMS FROM STRIPE
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

    // CALCULATE ITEMS PRICE
    const itemsPrice = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    // TOTAL PRICE
    // const totalPrice = session.amount_total / 100;

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

      //   console.log("Cart cleared");
    }

    // console.log("Stripe order created");

    return order;
  } catch (error) {
    console.error("[PROCESS STRIPE ORDER ERROR]:", error);

    throw error;
  }
};
