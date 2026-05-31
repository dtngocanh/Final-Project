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

// add product
productRouter.post("/add", upload.array("images", 10), authSeller, addProduct);

// get all products
productRouter.get("/list", productList);

productRouter.get("/search",searchProducts)


// get single product
productRouter.get("/:id", productById);

// change stock
productRouter.post("/stock", authSeller, changeStock);

//upload product list
// productRouter.post("/import", authSeller, importProducts);

//upload product list
productRouter.post(
  "/import", 
  authSeller, 
  excelUpload.single("file"), 
  importProducts
);

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

// get related product
productRouter.get("/related-v2/:id", getRelatedProductsFromDB)
// get freq products
productRouter.get("/freq/:id", getFreqProducts)


export default productRouter;
