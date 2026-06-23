import mongoose from "mongoose";
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  isVerifiedPurchase: { type: Boolean, default: false },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'order',
  },
}, { timestamps: true });

reviewSchema.index({ user: 1, product: 1 , order: 1}, { unique: true });

const Review = mongoose.models.review || mongoose.model("review", reviewSchema);
export default Review;