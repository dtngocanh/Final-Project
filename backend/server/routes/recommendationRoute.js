import express from "express";
import { getRecommendations } from "../controllers/recommendationController.js";
import authUser from "../middlewares/authUser.js";
const recRouter = express.Router();

//  /api/recommendations
recRouter.get("/",authUser, getRecommendations);

export default recRouter;