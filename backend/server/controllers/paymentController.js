import Stripe from "stripe";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import { calculateShippingFee } from "../services/ghnService.js";
import { createStripeLineItems } from "../services/paymentService.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { orderItems, shippingInfo } = req.body;
    const userId = req.user ? req.user._id.toString() : "GUEST_USER";

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ success: false, message: "Missing STRIPE_SECRET_KEY on Render" });
    }

    const shippingRs = await calculateShippingFee({
      cartItems: orderItems,
      to_district_id: shippingInfo.districtId,
      to_ward_code: shippingInfo.wardCode,
    });

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: "No items found in your order" });
    }

    if (!shippingRs || shippingRs.feeUSD == null || shippingRs.feeVND == null) {
      return res.status(400).json({ success: false, message: "Unable to calculate shipping fee" });
    }

    // CHECK STOCK 
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `${item.name} not found` });
      if (product.stock === 0) return res.status(400).json({ success: false, message: `${product.name} is out of stock` });
      if (product.stock < item.quantity) return res.status(400).json({ success: false, message: `${product.name} is insuficient` });
    }

    const line_items = await createStripeLineItems({
      orderItems,
      shippingResult: shippingRs,
    });

    // 2. TỐI ƯU METADATA
    const compactItems = orderItems.map((item) => ({
      p: item.product.toString(), 
      q: item.quantity,  
      pr: item.price       
    }));

    // Cấu hình các tham số tạo Session
    const sessionData = {
      payment_method_types: ["card"],
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      mode: "payment",
      line_items,
      metadata: {
        userId: userId,
        orderItems: JSON.stringify(compactItems).substring(0, 450), 
        fullName: shippingInfo.fullName,
        phone: shippingInfo.phone,
        address: `${shippingInfo.address}, ${shippingInfo.city}`,
        districtId: shippingInfo.districtId.toString(),
        wardCode: shippingInfo.wardCode.toString(),
        shippingFeeVND: shippingRs.feeVND.toString(),
        shippingFeeUSD: shippingRs.feeUSD.toString(),
        provineId: shippingInfo.provineId ? shippingInfo.provineId.toString() : "0",
        country: shippingInfo.country || "Vietnam"
      },
    };

    if (shippingInfo.email) {
      sessionData.customer_email = shippingInfo.email;
    }

    const session = await stripe.checkout.sessions.create(sessionData);
    res.status(200).json({ id: session.id, url: session.url });

  } catch (error) {
    console.error("STRIPE ERROR DETAILS:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};