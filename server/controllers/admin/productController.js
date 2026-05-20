import Product from "../../models/Product.js";
import RestockLog from "../../models/PurchaseOrder.js";

export const replenishStock = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // 1. Kiểm tra dữ liệu đầu vào
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: "Invalid product or quantity" });
    }

    // 2. Tìm sản phẩm và cập nhật tăng số lượng stock ($inc = increment trong MongoDB)
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: Number(quantity) } }, 
      { new: true } // Trả về data mới sau khi đã cập nhật
    ).populate('category'); // Populate nếu category của bạn là một Object

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    const newLog = await RestockLog.create({
      product: productId,
      quantityAdded: Number(quantity),
      // supplier: "Veganic Wholesale Farm"
    });

    res.status(200).json({
      success: true,
      message: "Stock replenished successfully!",
      product: updatedProduct,
      log: newLog
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecentRestockLogs = async (req, res) => {
  try {
    // Lấy 10 log mới nhất, dùng .populate("product") để lấy kèm tên sản phẩm
    const logs = await RestockLog.find()
      .populate("product")
      .sort({ createdAt: -1 }) // Xếp log mới nhất lên đầu
      .limit(10);

    res.status(200).json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
