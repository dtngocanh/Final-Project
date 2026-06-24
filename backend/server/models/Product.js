import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    price: {
      type: Number,
      required: true,
    },
    discountPrice: { type: Number, default: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    categoryName: { type: String },
    images: [
      {
        public_id: String,
        url: String,
      },
    ],

    ratings: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
    },

    tags: {
      type: [String],
      index: true,
    },
    salesCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    shelfLifeDays: {
      type: Number,
      default: 7,
    },
    // try.....
    related_product_ids: [{ type: String }],
    frequentlyBoughtTogether: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        image: String,
      },
    ],
  },
  { timestamps: true },
);

productSchema.index({ name: "text", description: "text", tags: "text" });

const Product =
  mongoose.models.product || mongoose.model("product", productSchema);
export default Product;
