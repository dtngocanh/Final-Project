import express from "express";
import authUser from "../middlewares/authUser.js";
import { getProductsByIngredients, suggestRecipes } from "../controllers/recipeController.js";

const recipeRouter = express.Router();

recipeRouter.get("/suggest", suggestRecipes);
recipeRouter.get("/by-ingredients", getProductsByIngredients);

export default recipeRouter;