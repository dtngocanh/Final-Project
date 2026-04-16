import Interaction from "../models/Interaction.js";
import Product from "../models/Product.js";
import ErrorHandler from "../utils/errorHandler.js";

export const trackClick = async (req, res, next) => {
  try {
    const { productId, action } = req.body;

    if (!productId) {
      return next(new ErrorHandler("Product ID is required", 400));
    }

    const newInteraction = new Interaction({
      userId: req.user._id || null,
      productId,
      action: action || "click",
    });
    await newInteraction.save();

    await Product.findByIdAndUpdate(productId, {
      $inc: { viewCount: 1 },
    });

    res.status(201).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách tương tác để phục vụ hệ thống Recommendation sau này
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
