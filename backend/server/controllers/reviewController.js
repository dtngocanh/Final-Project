import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import ErrorHandler from "../utils/errorHandler.js";

const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });

  const numOfReviews = reviews.length;
  const ratings =
    numOfReviews === 0
      ? 0
      : reviews.reduce((acc, item) => item.rating + acc, 0) / numOfReviews;

  await Product.findByIdAndUpdate(productId, {
    ratings,
    numOfReviews,
  });
};

export const postReview = async (req, res, next) => {
  try {
    const { rating, comment, productId } = req.body;

    // 1. Kiểm tra đơn hàng đã giao chưa
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      "orderItems.product": productId,
      orderStatus: "Delivered",
    });

    if (!hasPurchased) {
      return next(
        new ErrorHandler(
          `You must purchase this product to post a review.`,
          403,
        ),
      );
    }
    // 2. Kiểm tra xem đã review chưa (Dựa trên Review model)
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId,
    });

    if (existingReview) {
      return next(
        new ErrorHandler("You have already reviewed this product.", 400),
      );
    }

    // 3. Tạo review mới trong Review Collection
    await Review.create({
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      comment,
      isVerifiedPurchase: true, // Vì đã check Order ở trên
    });

    // 4. Cập nhật lại stats bên Product model
    await updateProductRating(productId);

    res.status(201).json({
      success: true,
      message: "Review added successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { rating, comment, productId } = req.body;

    const review = await Review.findOne({
      user: req.user._id,
      product: productId,
    });

    if (!review) {
      return next(
        new ErrorHandler(
          "Review not found. You need to post a review first.",
          404,
        ),
      );
    }

    // 2. Cập nhật dữ liệu
    review.rating = Number(rating);
    review.comment = comment;
    await review.save();

    // 3. Tính toán lại điểm trung bình
    await updateProductRating(productId);

    res.status(200).json({
      success: true,
      message: "Review updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllShopReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name")
      .populate("product", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};
