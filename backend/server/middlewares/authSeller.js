import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler.js";
import User from "../models/User.js";

const authSeller = async (req, res, next) => {
  try {
    const token = req.cookies.sellerToken;

    if (!token) {
      return next(new ErrorHandler("Not authorized", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("_id name email role");

    if (user.role !== "admin") {
      return next(new ErrorHandler("Access denied", 403));
    }

    if (!user) {
      return next(new ErrorHandler("User not found", 401));
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default authSeller;
