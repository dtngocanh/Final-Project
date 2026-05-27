// ../models/Notification.js
import mongoose from "mongoose";
import User from "./User.js"
import Order from "./Order.js"
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", notificationSchema);