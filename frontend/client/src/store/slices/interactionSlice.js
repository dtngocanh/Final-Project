import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const trackClickThunk = createAsyncThunk(
  "interaction/trackClick",
  async ({ productId, action, searchQuery }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/interaction/track", {
        productId,
        action,
        searchQuery,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const getRecommendationsThunk = createAsyncThunk(
  "interaction/getRecommendations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/interaction/recommendations");
      // console.log("Recommendations:", response.data);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const interactionSlice = createSlice({
  name: "interaction",
  initialState: {
    recommendations: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearInteractionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(trackClickThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(trackClickThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(trackClickThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // console.error("Tracking Error:", action.payload);
      })
      // Get Recommendations
      .addCase(getRecommendationsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRecommendationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload.data; // Lưu data từ API vào store
      })
      .addCase(getRecommendationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearInteractionError } = interactionSlice.actions;
export default interactionSlice.reducer;
