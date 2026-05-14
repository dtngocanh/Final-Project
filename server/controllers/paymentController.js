import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { orderItems, shippingInfo } = req.body;

    const userId = req.user ? req.user._id.toString() : "GUEST_USER";

    console.log("1. Create Session for userId:", userId);

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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      success_url: `${process.env.FRONTEND_URL}/success`,
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

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("STRIPE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
