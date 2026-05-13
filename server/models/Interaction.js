import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    default: null,
  },
  sessionId: {
    type: String,
    index: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  action: {
    type: String,
    enum: ["click", "view", "add_to_cart", "search_click", "order"],
    default: "view",
  },
  searchQuery: {
    type: String,
    default: null,
  },
  score: {
    type: Number,
    default: 1,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: "30d",
  },
});
interactionSchema.index({ userId: 1, sessionId: 1 });

const Interaction =
  mongoose.models.interaction ||
  mongoose.model("interaction", interactionSchema);
export default Interaction;
