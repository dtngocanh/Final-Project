import express from "express";
import { upload } from "../configs/multer.js";
import multer from "multer";
import {
  addProduct,
  productList,
  productById,
  changeStock,
  importProducts,
  deleteProduct,
  updateProduct,
  getRelatedProductsFromDB,
  getFreqProducts,
  searchProducts,
} from "../controllers/productController.js";

import authSeller from "../middlewares/authSeller.js";
import authUser from "../middlewares/authUser.js";
// import
const excelStorage = multer.memoryStorage();
const excelUpload = multer({ 
  storage: excelStorage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

const productRouter = express.Router();


productRouter.get("/search",searchProducts)


// get single product
productRouter.get("/:id", productById);

// change stock
productRouter.post("/stock", authSeller, changeStock);


//upload product list
productRouter.post(
  "/import", 
  authSeller, 
  excelUpload.single("file"), 
  importProducts
);


// get related product
productRouter.get("/related-v2/:id", getRelatedProductsFromDB)
// get freq products
productRouter.get("/freq/:id", getFreqProducts)


export default productRouter;
