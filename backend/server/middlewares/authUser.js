import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";

// const authUser = async (req, res, next) => {
//     const { token } = req.cookies;

//     if (!token) {
//         return res.json({ success: false, message: 'Not Authorized' });

//      }

//     try {
//         const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
//         if (tokenDecode.id) {
//             // Gán ID từ token vào req.user để các hàm sau sử dụng
//             req.user = { _id: tokenDecode.id };
//             next();
//         } else {
//             return res.json({ success: false, message: 'Not Authorized' });
//         }
//     } catch (error) {
//         return res.json({ success: false, message: error.message });
//     }
// }

const authUser = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not Authorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("_id name email role");

    if (user.role !== "user") {
      return next(new ErrorHandler("Access denied", 403));
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export default authUser;
