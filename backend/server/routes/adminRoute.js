import express from "express";
import { upload } from "../configs/multer.js";
import multer from "multer";
import {
  deleteUser,
  getAllUsers,
  isSellerAuth,
  sellerLogin,
  sellerLogout,
} from "../controllers/adminController.js";
import authSeller from "../middlewares/authSeller.js";
import { updatePassword } from "../controllers/passwordController.js";
import { getAllOrders } from "../controllers/orderController.js";
import {
  addProduct,
  changeStock,
  deleteProduct,
  productList,
  updateProduct,
} from "../controllers/productController.js";
import {
  createCategory,
  getCategories,
  updateCategory,
} from "../controllers/categoryController.js";

const sellerRouter = express.Router();

// AUTH
sellerRouter.post("/login", sellerLogin);
sellerRouter.get("/is-auth", authSeller, isSellerAuth);
sellerRouter.get("/logout", authSeller, sellerLogout);
sellerRouter.get("/users", authSeller, getAllUsers);
sellerRouter.delete("/users/delete/:id", authSeller, deleteUser);
sellerRouter.put("/password/update", authSeller, updatePassword);

// ORDERS
sellerRouter.get("/orders", authSeller, getAllOrders);

// PRODUCTS
sellerRouter.get("/products", authSeller, productList);
sellerRouter.post(
  "/product",
  upload.array("images", 10),
  authSeller,
  addProduct,
);
sellerRouter.delete("/products/:id", authSeller, deleteProduct);
sellerRouter.patch(
  "/products/:id",
  upload.array("images", 3),
  authSeller,
  updateProduct,
);
sellerRouter.post("/products/stock", authSeller, changeStock);

// CATEGORY
sellerRouter.get("/categories", authSeller, getCategories);
sellerRouter.post("/categories", authSeller, createCategory);
sellerRouter.patch("/categories/:id", authSeller, updateCategory);

export default sellerRouter;
