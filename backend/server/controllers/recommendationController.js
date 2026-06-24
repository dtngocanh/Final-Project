import Recommendation from "../models/UserRecommendation.js";
import Product from "../models/Product.js";

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user?._id;

    // =========================
    // HELPER: RANDOM & FORMAT
    // =========================
    const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

    // FIX: Đảm bảo formatProduct lấy đúng discountPrice realtime từ product
    const formatProduct = (product, extra = {}) => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      images: product.images || [],
      image: product.images?.[0]?.url || null,
      stock: product.stock,
      ratings: product.ratings || 0,
      discountPrice: product.discountPrice ?? 0, // Lấy giá giảm realtime
      ...extra,
    });

    // =========================
    // FUNCTION: GET RANDOM/TRENDING
    // =========================
    const getFallbackProducts = async () => {
      // FIX 1: Thêm "discountPrice" vào chuỗi select
      const trending = await Product.find({})
        .select("name price discountPrice images stock ratings salesCount viewCount")
        .sort({ salesCount: -1, viewCount: -1 })
        .limit(40);

      const randomList = shuffleArray(trending).slice(0, 12);
      
      return randomList.map((item) =>
        formatProduct(item, {
          type: "trending",
          reason: "Popular products you might like",
        })
      );
    };

    // =====================================
    // CASE 1: KHÁCH HOẶC CHƯA ĐĂNG NHẬP
    // =====================================
    if (!userId) {
      const list = await getFallbackProducts();
      return res.status(200).json({
        success: true,
        type: "trending",
        count: list.length,
        list,
      });
    }

    // =====================================
    // CASE 2: USER ĐÃ ĐĂNG NHẬP -> TÌM SVD
    // =====================================
    // FIX 2: Thêm "discountPrice" vào populate select để đồng bộ từ bảng Product gốc
    const data = await Recommendation.findOne({ userId }).populate({
      path: "recommendations.productId",
      model: "product",
      select: "name price discountPrice images stock ratings salesCount viewCount",
    });

    // Nếu có dữ liệu SVD và có mảng recommendations
    if (data && data.recommendations?.length > 0) {
      const list = data.recommendations
        .filter((item) => item.productId) // Lọc bỏ nếu sản phẩm bị xóa khỏi DB
        .map((item) =>
          formatProduct(item.productId, {
            reason: item.reason,
            type: item.type || "personalized",
          })
        );

      return res.status(200).json({
        success: true,
        type: "personalized",
        count: list.length,
        list,
      });
    }

    // =====================================
    // CASE 3: USER ĐÃ ĐĂNG NHẬP NHƯNG CHƯA CÓ SVD
    // =====================================
    const fallbackList = await getFallbackProducts();
    return res.status(200).json({
      success: true,
      type: "trending",
      count: fallbackList.length,
      list: fallbackList,
      message: "New user? Here are some trending products for you!",
    });

  } catch (error) {
    console.error("Lỗi getRecommendations:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};