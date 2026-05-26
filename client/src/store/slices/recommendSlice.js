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

const recommendSlice = createSlice({
  name: "recommender",
  initialState: {
    list: [],
    type: "trending",
    isLoading: false,
    error: null,
    recipes: [],
  },
  reducers: {
    resetRecommender: (state) => {
      state.list = [];
      state.type = "trending";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.isLoading = false;
        // Map the payload to your state keys
        state.list = action.payload.list; // Using 'list' from the thunk return
        state.type = action.payload.type;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.list = [];
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.recipes = action.payload;
      });
  },
});

export const { resetRecommender } = recommendSlice.actions;
export default recommendSlice.reducer;
