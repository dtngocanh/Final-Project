import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

const shippingInfoSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
});

const paymentInfoSchema = new mongoose.Schema({
  id: String,
  status: {
    type: String,
    enum: ["Paid", "Pending", "Failed"],
  },
  method: {
    type: String,
    enum: ["Stripe", "COD"],
    required: true,
  },
  paidAt: { type: Date },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },

    orderItems: {
      type: [orderItemSchema],
      required: true,
    },

    shippingInfo: {
      type: shippingInfoSchema,
      required: true,
    },
    paymentInfo: {
      type: paymentInfoSchema,
      required: true,
    },

    itemsPrice: {
      type: Number,
      required: true,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
    },
    paidAt: Date,
    orderStatus: {
      type: String,
      required: true,
      enum: ["Processing", "Shipped", "Delivered", "Canceled"],
      default: "Processing", // when creating new order
    },
    deliveredAt: Date,
  },
  { timestamps: true },
);
const Order = mongoose.models.order || mongoose.model("order", orderSchema);
export default Order;
