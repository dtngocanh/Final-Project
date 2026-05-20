import express from "express";
import authSeller from "../../middlewares/authSeller.js";
import { getRecentRestockLogs, replenishStock } from "../../controllers/admin/productController.js";
const productAdRouter = express.Router();

productAdRouter.post("/replenish", replenishStock);
productAdRouter.get("/restock-logs", getRecentRestockLogs);

export default productAdRouter;