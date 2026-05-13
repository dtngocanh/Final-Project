import Interaction from "../models/Interaction.js";
import Product from "../models/Product.js";
import ProductSimilarity from "../models/ProductSimilarity.js";
import ErrorHandler from "../utils/errorHandler.js";

export const trackInteraction = async (req, res, next) => {
  try {
    const { productId, action, searchQuery } = req.body;
    const userId = req.user?._id || null;
    const sessionId = req.headers["x-session-id"] || null;

    if (!productId)
      return next(new ErrorHandler("Product ID is required", 400));

    const actionScores = { view: 2, click: 1, add_to_cart: 4, order: 5 };
    const score = actionScores[action] || 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = {
      productId,
      timestamp: today,
      // Truy vấn tìm theo userId nếu có, không thì theo sessionId
      ...(userId ? { userId } : { sessionId }),
    };

    const update = {
      $max: { score: score },
      $set: {
        action: action,
        searchQuery: searchQuery || null,
        // Nếu bây giờ có userId , ta cập nhật nó vào bản ghi luôn
        ...(userId && { userId }),
      },
      $setOnInsert: {
        // Chỉ để lại những thứ CỐ ĐỊNH khi tạo mới
        productId,
        timestamp: today,
        sessionId,
        // Nếu không có userId ở $set, bạn mới để userId ở đây.
      },
    };

    await Interaction.findOneAndUpdate(query, update, {
      upsert: true,
      new: true,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getInteractions = async (req, res) => {
  try {
    const interactions = await Interaction.find()
      .populate("userId", "name email")
      .populate("productId", "name price");
    res.status(200).json(interactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInteractionsForAI = async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const interactions = await Interaction.find({
    timestamp: { $gte: sevenDaysAgo },
  });
  res.status(200).json(interactions);
};

export const getHomeRecommendations = async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.headers["x-session-id"];

    // 1. Tìm 5 interactions gần nhất (tăng lên 5 để đa dạng hơn)
    const recentInteractions = await Interaction.find({
      $or: [
        ...(userId ? [{ userId: userId }] : []),
        ...(sessionId ? [{ sessionId: sessionId }] : []),
      ],
    })
      .sort({ timestamp: -1 })
      .limit(5)
      .select("productId")
      .lean();

    if (!recentInteractions.length) {
      const fallback = await Product.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      return res.status(200).json({ success: true, data: fallback });
    }

    const interactedProductIds = recentInteractions.map((i) =>
      i.productId.toString(),
    );

    // 2. Lấy dữ liệu tương đồng
    const similarities = await ProductSimilarity.find({
      productId: { $in: interactedProductIds },
    }).lean();

    // 3. Thuật toán Scoring đơn giản
    const scoreMap = {}; // { productId: totalScore }

    similarities.forEach((sim) => {
      sim.similarProducts.forEach((item) => {
        const sId = item.productId.toString();

        // Không gợi ý lại sản phẩm người dùng vừa mới tương tác
        if (interactedProductIds.includes(sId)) return;

        // Cộng dồn score. Nếu SP xuất hiện nhiều lần, score sẽ cao lên.
        scoreMap[sId] = (scoreMap[sId] || 0) + item.score;
      });
    });

    // 4. Sắp xếp các ID theo score từ cao xuống thấp
    const sortedIds = Object.keys(scoreMap)
      .sort((a, b) => scoreMap[b] - scoreMap[a])
      .slice(0, 12); // Lấy top 12 sản phẩm tốt nhất

    // 5. Truy vấn chi tiết sản phẩm
    const recommendedProducts = await Product.find({
      _id: { $in: sortedIds },
    }).lean();

    // Lưu ý: MongoDB trả về kết quả không theo thứ tự sortedIds, cần sort lại một chút ở JS
    const finalResult = recommendedProducts.sort((a, b) => {
      return (
        sortedIds.indexOf(a._id.toString()) -
        sortedIds.indexOf(b._id.toString())
      );
    });

    res.status(200).json({
      success: true,
      data: finalResult,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
