import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  name: String,
  rating: Number,
  comment: String
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  category: String,
  subcategory: String,

  ratings: {
    type: Number,
    default: 0
  },
  numOfReviews: {
    type: Number,
    default: 0
  },

  images: [
    {
      public_id: String,
      url: String
    }
  ],

  stock: {
    type: Number,
    required: true
  },

  reviews: [reviewSchema],

}, { timestamps: true });

const Product = mongoose.models.product || mongoose.model('product', productSchema)
export default Product;