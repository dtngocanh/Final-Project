import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler.js";
import User from "../models/User.js";

// const authSeller = async (req, res, next) => {
//     const { sellerToken } = req.cookies;

//     if (!sellerToken) {
//         return res.json({ success: false, message: 'Not Authorized' });
//     }

//     try {
//         const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET)
//         if (tokenDecode.email === process.env.SELLER_EMAIL) {
//             next();
//         } else {
//             return res.json({ success: false, message: 'Not Authorized' });
//         }
//     } catch (error) {
//         return res.json({ success: false, message: error.message });
//     }
// }
const authSeller = async (req, res, next) => {
    try {
        const token = req.cookies.sellerToken;

        if (!token) {
            return next(new ErrorHandler("Not authorized", 401));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new ErrorHandler("User not found", 401))
        }
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

export default authSeller;