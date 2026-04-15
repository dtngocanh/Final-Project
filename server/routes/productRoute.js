import express from "express";
import { upload } from "../configs/multer.js";
import {
  addProduct,
  productList,
  productById,
  changeStock,
  importProducts,
  deleteProduct,
  updateProduct,
} from "../controllers/productController.js";

import authSeller from "../middlewares/authSeller.js";

const productRouter = express.Router();

// add product
productRouter.post("/add", upload.array("images", 10), authSeller, addProduct);

// get all products
productRouter.get("/list", productList);

// get single product
productRouter.get("/:id", productById);

// change stock
productRouter.post("/stock", authSeller, changeStock);

//upload product list
productRouter.post("/import", authSeller, importProducts);

//delete a product
productRouter.delete("/delete/:id", authSeller, deleteProduct);

//update a product
productRouter.patch(
  "/:id",
  upload.array("images", 3),
  authSeller,
  updateProduct,
);

// productRouter.post("/track-click", handleInteraction);

export default productRouter;
