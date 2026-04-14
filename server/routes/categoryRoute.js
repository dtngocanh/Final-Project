import express from "express";
import { getCategories } from "../controllers/categoryController.js";

const categoryRouter = express.Router();

categoryRouter.get("/list", getCategories);

export default categoryRouter;