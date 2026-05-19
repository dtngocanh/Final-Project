import Stripe from "stripe";
import Order from "../models/Order.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import { calculateShippingFee } from "../services/ghnService.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { orderItems, shippingInfo } = req.body;

    const userId = req.user ? req.user._id.toString() : "GUEST_USER";

    const shippingRs = await calculateShippingFee({
      cartItems: orderItems,

      to_district_id: shippingInfo.districtId,

      to_ward_code: shippingInfo.wardCode,
    });
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
        orderItems: JSON.stringify(compactItems),

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
        shippingFeeUSD: shippingRs.feeUSD.toString(),

        shippingFeeVND: shippingRs.feeVND.toString(),
      },
    });

    res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("STRIPE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
