import express from "express";
import { isAuth, login, logout, register, updateProfile } from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import { forgotPassword, resetPassword, updatePassword } from "../controllers/passwordController.js";
import { getAllShopReviews, postReview, updateReview } from "../controllers/reviewController.js";

const userRouter = express.Router();

userRouter.post('/register', register)
userRouter.post('/login', login)
userRouter.get('/is-auth',authUser, isAuth)
userRouter.get('/logout',authUser, logout)

userRouter.post('/password/forgot',forgotPassword);
userRouter.put('/password/reset/:token',resetPassword);

userRouter.put('/password/update',authUser,updatePassword);
userRouter.patch('/profile/update',authUser,updateProfile);

userRouter.post('/review',authUser,postReview);
userRouter.put('/review',authUser,updateReview);
userRouter.get('/review',getAllShopReviews);

// Lấy gợi ý "Dành riêng cho bạn" (Dựa trên User ID - Collaborative Filtering)
// userRouter.get('/recommendations/personalized', authUser, getPersonalizedRecs);

// // Lấy gợi ý "Sản phẩm tương đương" (Dựa trên Product ID - Item-Item Similarity)
// userRouter.get('/recommendations/related/:productId', getRelatedByRating);


export default userRouter;