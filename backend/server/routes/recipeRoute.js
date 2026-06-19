import express from "express";
import authUser from "../middlewares/authUser.js";
import { getProductsByIngredients, suggestRecipes, getBestRecipeMatch } from "../controllers/recipeController.js";

const recipeRouter = express.Router();

recipeRouter.get("/suggest", suggestRecipes);
recipeRouter.get("/by-ingredients", getProductsByIngredients);
recipeRouter.get("/best-match", getBestRecipeMatch);

export default recipeRouter;