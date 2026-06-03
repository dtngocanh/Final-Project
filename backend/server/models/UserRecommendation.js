import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    recommendations: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        reason: {
          type: String,
          default: "Picked for you",
        },

        type: {
          type: String,
          default: "personalized",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// TÊN MODEL = UserRecommendation
// COLLECTION = user_recommendations

const UserRecommendation = mongoose.model(
  "UserRecommendation",
  recommendationSchema,
  "user_recommendations"
);

export default UserRecommendation;