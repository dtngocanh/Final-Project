import Stripe from 'stripe';
import Order from '../models/Order.js';
import User from '../models/User.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// console.log(process.env.STRIPE_WEBHOOK_KEY);

export const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body, 
            sig,
            process.env.STRIPE_WEBHOOK_KEY
        );
        
        if (event.type === 'checkout.session.completed') {
            await processOrder(event.data.object);
        }

        return res.status(200).json({ received: true });

    } catch (err) {
        console.error("WEBHOOK ERROR:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
};

const processOrder = async (session) => {
    try {
        // console.log(session.id);

        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
            expand: ['data.price.product'],
        });

        const { userId, shippingInfo } = session.metadata;
        
        let parsedShipping;
        try {
            parsedShipping = typeof shippingInfo === 'string' ? JSON.parse(shippingInfo) : shippingInfo;
        } catch (e) {
            console.error("Error Parse ShippingInfo:", e.message);
            return; 
        }

        // --- XOÁ GIỎ HÀNG ---
        if (userId && userId !== "GUEST_USER") {
            await User.findByIdAndUpdate(userId, { $set: { cartItems: [] } });
            console.log("2. Clear Cart DB");
        }

        // --- CHUẨN BỊ DATA ---
        const orderItems = lineItems.data.map(item => {
            const stripeProduct = item.price.product;
            return {
                product: stripeProduct.metadata?.productId || stripeProduct.id, 
                name: item.description,
                price: item.price.unit_amount / 100,
                quantity: item.quantity,
                image: stripeProduct.images?.[0] || "",
            };
        });

        const orderData = {
            user: (userId && userId !== "GUEST_USER") ? userId : null,
            orderItems,
            shippingInfo: parsedShipping,
            paymentInfo: {
                id: session.payment_intent || session.id,
                status: "Paid"
            },
            itemsPrice: session.amount_subtotal / 100,
            totalPrice: session.amount_total / 100,
            paidAt: new Date(),
        };

        // --- LƯU DATABASE ---
        const newOrder = new Order(orderData);
        await newOrder.save();
        console.log("3. Saved New Order");

    } catch (error) {
        // Log toàn bộ error thay vì chỉ .message để thấy lỗi Validation nếu có
        console.error("[PROCESS ORDER ERROR]:", error); 
    }
};