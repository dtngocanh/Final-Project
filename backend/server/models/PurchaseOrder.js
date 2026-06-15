import mongoose from "mongoose";
import Product from "./Product.js";

const restockLogSchema = new mongoose.Schema(
  {
    // Liên kết với ID của sản phẩm trong bảng Product
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    // Số lượng nạp thêm vào trong đợt này
    quantityAdded: {
      type: Number,
      required: true,
    },
    // Tên nhà cung cấp
    supplier: {
      type: String,
      default: "Veggies Wholesale Farm",
    },
    operator: {
      type: String,
      default: "Admin",
    }
  },
  { 
    // createdAt và updatedAt
    timestamps: true, 
  }
);

const RestockLog = mongoose.model("RestockLog", restockLogSchema);
export default RestockLog;