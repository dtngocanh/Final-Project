import express from "express";
import { deleteUser, getAllUsers, isSellerAuth, sellerLogin, sellerLogout } from "../controllers/adminController.js";
import authSeller from "../middlewares/authSeller.js";
import { updatePassword } from "../controllers/passwordController.js";
import { getAllOrders } from "../controllers/orderController.js";

const sellerRouter = express.Router();

sellerRouter.post('/login', sellerLogin);
sellerRouter.get('/is-auth',authSeller, isSellerAuth);
sellerRouter.get('/logout',authSeller, sellerLogout);
sellerRouter.get('/users',authSeller, getAllUsers);

sellerRouter.delete('/users/delete/:id',authSeller, deleteUser);

sellerRouter.put('/password/update',authSeller,updatePassword);

sellerRouter.get('/orders',authSeller,getAllOrders);


export default sellerRouter;