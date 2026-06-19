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

export const getBestRecipeMatch = async (req, res) => {
  try {
    const ingredientsQuery = req.query.ingredients;

    if (!ingredientsQuery) {
      return res.status(400).json({
        success: false,
        message: "Please provide a comma-separated list of ingredients",
      });
    }

    // e.g. "chicken,tomato,garlic" -> ["chicken", "tomato", "garlic"]
    const ingredientList = ingredientsQuery
      .split(",")
      .map((item) => item.trim().toLowerCase());

    const mealMap = new Map();

    // 1. Fetch meals for EVERY ingredient concurrently
    const fetchPromises = ingredientList.map((ingredient) =>
      axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`)
    );

    const responses = await Promise.all(fetchPromises);

    // 2. Score the meals based on how many ingredients match
    responses.forEach((response, index) => {
      const currentIngredient = ingredientList[index];
      const meals = response.data.meals || [];

      meals.forEach((meal) => {
        if (mealMap.has(meal.idMeal)) {
          const existingMeal = mealMap.get(meal.idMeal);
          existingMeal.matchCount += 1;
          existingMeal.matchedIngredients.push(currentIngredient);
        } else {
          mealMap.set(meal.idMeal, {
            ...meal,
            matchCount: 1,
            matchedIngredients: [currentIngredient],
          });
        }
      });
    });

    const allMeals = Array.from(mealMap.values());

    if (allMeals.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No recipes found for these ingredients. Try different ones!",
      });
    }

    // 3. Sắp xếp giảm dần theo matchCount để đưa món khớp nhiều nhất lên đầu
    allMeals.sort((a, b) => b.matchCount - a.matchCount);

    //  THAY ĐỔI TẠI ĐÂY: Lấy top 4 món ăn tốt nhất (thay vì chỉ lấy 1 món)
    const topMatches = allMeals.slice(0, 4);

    // 4. Fetch FULL chi tiết cho cả 4 món cùng một lúc một cách mượt mà
    const detailPromises = topMatches.map(async (matchedMeal) => {
      try {
        const detailResponse = await axios.get(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${matchedMeal.idMeal}`
        );
        const fullDetails = detailResponse.data.meals?.[0] || matchedMeal;
        
        // Gộp thông tin thống kê số lượng ingredient match vào object món ăn luôn
        return {
          ...fullDetails,
          matchStats: {
            totalIngredientsProvided: ingredientList.length,
            matchedIngredients: matchedMeal.matchedIngredients,
            matchScore: matchedMeal.matchCount,
          }
        };
      } catch (err) {
        // Dự phòng nếu lỗi API đơn lẻ thì giữ nguyên dữ liệu rút gọn
        return matchedMeal;
      }
    });

    const detailedRecipes = await Promise.all(detailPromises);

    // 5. Trả về mảng array chứa đầy đủ cả các món ngon
    res.json({
      success: true,
      recipes: detailedRecipes,
    });

  } catch (error) {
    console.error("Recipe Match Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while finding the best recipes.",
    });
  }
};