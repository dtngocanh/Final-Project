import Stripe from "stripe";
import { processStripeOrder } from "../services/orderService.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_KEY,
    );

    if (event.type === "checkout.session.completed") {
      await processStripeOrder(event.data.object);
    }

    res.status(200).json({
      received: true,
    });

  } catch (err) {
    console.error("WEBHOOK ERROR:", err.message);

    res.status(400).send(
      `Webhook Error: ${err.message}`,
    );
  }
};