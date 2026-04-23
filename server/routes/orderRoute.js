import express from "express";
import authUser from "../middlewares/authUser.js";
import authSeller from "../middlewares/authSeller.js";
import {
  placeOrderCOD,
  getAllOrders,
  getUserOrders,
  cancelOrder,
  getOrderDetails
} from "../controllers/orderController.js ";

const orderRouter = express.Router();

orderRouter.post("/new", authUser, placeOrderCOD);
orderRouter.get("/user", authUser, getUserOrders);
orderRouter.get("/seller", authSeller, getAllOrders);
orderRouter.post(`/cancel`, authUser, cancelOrder);
orderRouter.get(`/:id`, authUser, getOrderDetails);
export default orderRouter;