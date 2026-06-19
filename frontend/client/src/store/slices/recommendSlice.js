import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";

export const fetchRecommendations = createAsyncThunk(
  "recommend/fetchRecommendations",
  async (_, thunkAPI) => {
    try {
      // Added timestamp to prevent aggressive browser caching
      const res = await axiosInstance.get(`/recommendations?_t=${Date.now()}`);

      // LOG TO DEBUG: Check your F12 console
      // console.log("API Response:", res.data);

      return {
        // MATCHING THE CONTROLLER: Controller returns 'list', not 'data'
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
export const fetchRecipes = createAsyncThunk(
  "product/fetchRecipes",

  async (ingredients, thunkAPI) => {
    try {
      // ingredients = ["chicken", "tomato", "onion"]

      const ingredientQuery = ingredients.join(",");

      // console.log(ingredientQuery);
      
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

export const fetchBestRecipe = createAsyncThunk(
  "recommend/fetchBestRecipe",
  async (ingredientQuery, thunkAPI) => {
    try {
      // Ở file giao diện Tủ Lạnh, ingredientQuery đã là dạng chuỗi: "thịt heo,trứng,cà chua"
      const res = await axiosInstance.get(
        `/recipes/best-match?ingredients=${ingredientQuery}&_t=${Date.now()}`
      );

      // Trả về toàn bộ data ({ success, matchStats, recipe })
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to find the perfect recipe",
      );
    }
  }
);

const recommendSlice = createSlice({
  name: "recommender",
  initialState: {
    list: [],
    type: "trending",
    isLoading: false,
    error: null,
    recipes: [],
    bestRecipeMatch: null, // Lưu riêng data của món ngon nhất
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
      // Xử lý recommendations
      .addCase(fetchRecommendations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.list;
        state.type = action.payload.type;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.list = [];
      })
      
      // Xử lý fetchRecipes cũ
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.recipes = action.payload;
      })

      // Xử lý fetchBestRecipe mới
      .addCase(fetchBestRecipe.fulfilled, (state, action) => {
        // Lưu data món ngon nhất vào state nếu muốn dùng ở component khác
        state.bestRecipeMatch = action.payload.recipe; 
      });
  },
});

export const { resetRecommender } = recommendSlice.actions;
export default recommendSlice.reducer;