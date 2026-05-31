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

    const shippingRs = await calculateShippingFee({
      cartItems: orderItems,

      to_district_id: shippingInfo.districtId,

      to_ward_code: shippingInfo.wardCode,
    });

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items found in your order",
      });
    }

    if (!shippingRs || shippingRs.feeUSD == null || shippingRs.feeVND == null) {
      return res.status(400).json({
        success: false,
        message: "Unable to calculate shipping fee",
      });
    }

    // CHECK STOCK
    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      // product bị xoá
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `${item.name} not found`,
        });
      }

      // hết hàng
      if (product.stock === 0) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is out of stock`,
        });
      }

      // quantity vượt stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} ${product.name} left in stock`,
        });
      }
    }

    const line_items = await createStripeLineItems({
      orderItems,
      shippingResult: shippingRs,
    });

    const compactItems = orderItems.map((item) => ({
      product: item.product.toString(),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      // image: item.image,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      success_url: `${process.env.FRONTEND_URL}/success`,
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
