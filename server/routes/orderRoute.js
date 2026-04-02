import express from "express";
import authUser from "../middlewares/authUser.js";
import authSeller from "../middlewares/authSeller.js";
import { getAllOrders, getUserOrders, cancelOrder } from "../controllers/orderController.js ";

const orderRouter = express.Router();

// orderRouter.post('/cod', authUser, placeOrderCOD)
orderRouter.get('/user', authUser, getUserOrders)
orderRouter.get('/seller', authSeller, getAllOrders)
orderRouter.post(`/cancel`, authUser, cancelOrder);
export default orderRouter