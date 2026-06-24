import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";

// THUNK: Lấy danh sách gợi ý (Trả về 'list' và 'type' từ backend)
export const fetchRecommendations = createAsyncThunk(
  "recommend/fetchRecommendations",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/recommendations?_t=${Date.now()}`);

      return {
        list: Array.isArray(res.data.list) ? res.data.list : [],
        type: res.data.type || "trending",
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch recommendations",
      );
    }
  },
);

// THUNK: Gợi ý công thức từ nguyên liệu
export const fetchRecipes = createAsyncThunk(
  "product/fetchRecipes",
  async (ingredients, thunkAPI) => {
    try {
      const ingredientQuery = ingredients.join(",");
      const res = await axiosInstance.get(
        `/recipes/suggest?ingredients=${ingredientQuery}&_t=${Date.now()}`,
      );
      return Array.isArray(res.data.meals) ? res.data.meals : [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch recipes",
      );
    }
  },
);

// THUNK: Tìm món ăn ngon nhất hợp với tủ lạnh
export const fetchBestRecipe = createAsyncThunk(
  "recommend/fetchBestRecipe",
  async (ingredientQuery, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/recipes/best-match?ingredients=${ingredientQuery}&_t=${Date.now()}`
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to find the perfect recipe",
      );
    }
  }
);

const recommendSlice = createSlice({
  name: "recommend", // Đã sửa từ 'recommender' -> 'recommend' cho khớp UI
  initialState: {
    list: [],
    type: "trending",
    isLoading: false,
    error: null,
    recipes: [],
    bestRecipeMatch: null, 
  },
  reducers: {
    resetRecommender: (state) => {
      state.list = [];
      state.type = "trending";
      state.error = null;
      state.bestRecipeMatch = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Recommendations
      .addCase(fetchRecommendations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.list;
        state.type = action.payload.type; // Nhận diện user SVD hay Fallback trending
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.list = [];
      })
      
      // Fetch Recipes
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.recipes = action.payload;
      })

      // Fetch Best Recipe
      .addCase(fetchBestRecipe.fulfilled, (state, action) => {
        state.bestRecipeMatch = action.payload.recipe; 
      });
  },
});

export const { resetRecommender } = recommendSlice.actions;
export default recommendSlice.reducer;