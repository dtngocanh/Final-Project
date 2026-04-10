import Product from "../models/Product.js";
import Order from "../models/Order.js";
import ErrorHandler from "../utils/errorHandler.js";

export const postReview = async (req, res, next) => {
  try {
    const { rating, comment, productId } = req.body;

    console.log(req.body);

    // 1. Kiểm tra đơn hàng
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      "orderItems.product": productId,
      orderStatus: "Delivered",
    });

    if (!hasPurchased) {
      return next(
        new ErrorHandler(`This product required to post a review.`, 403),
      );
    }

    const product = await Product.findById(productId);
    if (!product) return next(new ErrorHandler("Product not found", 404));

    // 2. Kiểm tra xem đã review chưa (Nếu có rồi thì không cho POST nữa)
    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString(),
    );

    if (isReviewed) {
      return next(
        new ErrorHandler(
          "You have already reviewed this product. Please update your existing review instead.",
          400,
        ),
      );
    }

    // 3. Thêm review mới
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;

    // 4. Cập nhật điểm trung bình
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save({ validateBeforeSave: false });

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

    const product = await Product.findById(productId);
    if (!product) return next(new ErrorHandler("Product not found", 404));

    const review = product.reviews.find(
      (rev) => rev?.user?.toString() === req.user?._id?.toString(),
    );
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

    // 3. Tính toán lại điểm trung bình (vì rating có thể đã thay đổi)
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save({ validateBeforeSave: false });

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
    const allReviews = await Product.aggregate([
      // 1. Lọc sản phẩm có review
      { $match: { "reviews.0": { $exists: true } } },

      // 2. Trải phẳng mảng reviews
      { $unwind: "$reviews" },

      // 3. LOOKUP: Tìm thông tin từ bảng "users" (Lưu ý: MongoDB thường tự thêm 's' vào tên model)
      {
        $lookup: {
          from: "users", // Tên collection của User trong Database (thường là số nhiều)
          localField: "reviews.user", // Field chứa ID user trong review
          foreignField: "_id", // Field ID trong bảng User
          as: "userDetails", // Tên tạm thời để chứa kết quả trả về
        },
      },

      // 4. Chuyển userDetails từ mảng thành object (vì lookup luôn trả về mảng)
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },

      // 5. Cấu trúc lại dữ liệu trả về
      {
        $project: {
          _id: "$reviews._id",
          userId: "$reviews.user",
          userName: { $ifNull: ["$userDetails.name", "$reviews.name"] },
          userAvatar: "$userDetails.avatar",
          rating: "$reviews.rating",
          comment: "$reviews.comment",
          createdAt: "$reviews.createdAt",
          productName: "$name",
          productId: "$_id",
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json({
      success: true,
      count: allReviews.length,
      reviews: allReviews,
    });
  } catch (error) {
    next(error);
  }
};
