import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      default: null,
    }, // Nếu là Fruit thì parent = null, nếu là Apple thì parent = ID của Fruit
    path: {
      type: String,
      default: ",", // Mặc định là dấu phẩy để dễ dùng Regex
    },
    level: { type: Number, default: 0 }, // 0 cho cate lớn, 1 cho subcate
  },
  { timestamps: true },
);
categorySchema.index({ path: 1 });
const Category =
  mongoose.models.category || mongoose.model("category", categorySchema);
export default Category;
