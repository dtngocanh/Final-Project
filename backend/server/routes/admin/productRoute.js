import express from "express";
import authSeller from "../../middlewares/authSeller.js";
import { deleteMockProducts, getExpiringSoonLogs, getRecentRestockLogs, importPostman, replenishStock } from "../../controllers/admin/productController.js";
const productAdRouter = express.Router();

productAdRouter.post("/replenish", replenishStock);
productAdRouter.get("/expiring-soon", getExpiringSoonLogs);
productAdRouter.get("/restock-logs", getRecentRestockLogs);
productAdRouter.post("/import", importPostman);
productAdRouter.get("/delmock", deleteMockProducts);

export default productAdRouter;