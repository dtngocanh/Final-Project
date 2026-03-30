import express from "express";
import { isAuth, login, logout, register } from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import { createCheckoutSession } from "../controllers/paymentController.js";
const paymentRouter = express.Router();
paymentRouter.post('/create-session', authUser, createCheckoutSession);
export default paymentRouter;

