import axios from "axios";
import Product from "../models/Product.js";

export const suggestRecipes = async (req, res) => {
  try {
    // Get ingredients from query
    const ingredients = req.query.ingredients;

    // Check if ingredients exist
    if (!ingredients) {
      return res.status(400).json({
        success: false,
        message: "Please provide ingredients",
      });
    }

    // Convert string to array
    // Example: "apple,milk,banana"
    const ingredientList = ingredients
      .split(",")
      .map((item) => item.trim().toLowerCase());

    // Main ingredient = first product
    const mainIngredient = ingredientList[0];

    // Store meals
    let mealMap = new Map();

    // Search meals by each ingredient
    for (const ingredient of ingredientList) {
      const response = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`,
      );

      const meals = response.data.meals || [];

      meals.forEach((meal) => {
        // If meal already exists
        if (mealMap.has(meal.idMeal)) {
          const existingMeal = mealMap.get(meal.idMeal);

          // Increase match count
          existingMeal.matchCount += 1;

          // Save matched ingredient
          existingMeal.ingredients.push(ingredient);
        } else {
          // Add new meal
          mealMap.set(meal.idMeal, {
            ...meal,
            matchCount: 1,
            ingredients: [ingredient],
          });
        }
      });
    }

    // Convert Map to Array
    const allMeals = Array.from(mealMap.values());

    // Find meals that match ALL ingredients
    const perfectMeals = allMeals.filter(
      (meal) => meal.matchCount === ingredientList.length,
    );

    // If perfect meals exist -> use them
    // Else -> use meals with main ingredient only
    const finalMeals =
      perfectMeals.length > 0
        ? perfectMeals
        : allMeals.filter((meal) =>
            meal.ingredients.includes(mainIngredient),
          );

    // Return response
    res.json({
      success: true,
      total: finalMeals.length,
      meals: finalMeals.slice(0, 10),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getProductsByIngredients = async (req, res) => {
  try {
    const ingredients = req.query.ingredients
      ?.split(",")
      .map((i) => i.trim().toLowerCase());

    if (!ingredients?.length) {
      return res.json([]);
    }

    const allProducts = await Product.find();

    const matchedProducts = allProducts
      .map((product) => {
        const productName = product.name.toLowerCase();

        const matchedIndex = ingredients.findIndex(
          (ingredient) =>
            productName.includes(ingredient) ||
            ingredient.includes(productName),
        );

        return {
          ...product.toObject(),
          matchedIndex,
        };
      })
      .filter((product) => product.matchedIndex !== -1)
      .sort((a, b) => a.matchedIndex - b.matchedIndex);

    res.json(matchedProducts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
