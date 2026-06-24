// file: models/Campaign.js (hoặc đường dẫn tương đương của ní)
import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    discountPercent: { type: Number, required: true },
    // SỬA TẠI ĐÂY: Thêm "product" vào enum để khớp cả số ít lẫn số nhiều từ Frontend gửi lên
    targetType: {
      type: String,
      enum: ["category", "products", "product"],
      required: true,
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "category" },

    // Giữ nguyên mảng chứa ID sản phẩm
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "product" }],

    // THÊM TRƯỜNG NÀY: Giới hạn số lượng sản phẩm được áp dụng giảm giá
    saleLimit: { type: Number, default: 0 }, // 0 nghĩa là không giới hạn (Unlimited)

    // THÊM TRƯỜNG NÀY: Theo dõi xem đã có bao nhiêu sản phẩm được bán ra trong chiến dịch này
    saleSold: { type: Number, default: 0 },

    startTime: { type: String, required: true }, // Format "HH:mm"
    endTime: { type: String, required: true }, // Format "HH:mm"
    // Thay đổi dòng này trong campaignSchema của ní:
    isActive: { type: Boolean, default: false }, // Đổi từ true thành false
  },
  { timestamps: true },
);

const Campaign =
  mongoose.models.campaign || mongoose.model("campaign", campaignSchema);
export default Campaign;
