import express from "express";
import { isAuth, login, logout, register, updateProfile } from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import { forgotPassword, resetPassword, updatePassword } from "../controllers/passwordController.js";

const userRouter = express.Router();

userRouter.post('/register', register)
userRouter.post('/login', login)
userRouter.get('/is-auth',authUser, isAuth)
userRouter.get('/logout',authUser, logout)

userRouter.post('/password/forgot',forgotPassword);
userRouter.put('/password/reset/:token',resetPassword);

userRouter.put('/password/update',authUser,updatePassword);
userRouter.patch('/profile/update',authUser,updateProfile);


export default userRouter;