import express from "express";
import authSeller from "../../middlewares/authSeller.js";
import { deleteMockProducts, getRecentRestockLogs, importPostman, replenishStock } from "../../controllers/admin/productController.js";
const productAdRouter = express.Router();

productAdRouter.post("/replenish", replenishStock);
productAdRouter.post("/expiring-soon", replenishStock);
productAdRouter.get("/restock-logs", getRecentRestockLogs);
productAdRouter.post("/import", importPostman);
productAdRouter.get("/delmock", deleteMockProducts);

export default productAdRouter;