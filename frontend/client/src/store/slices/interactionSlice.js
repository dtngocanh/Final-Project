import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";

// Thunk 1: Lưu vết hành vi của user (click, add_to_cart, order...) lên DB
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
      return rejectWithValue(error.response?.data || "Tracking failed");
    }
  }
);

// Thunk 2: Lấy danh sách sản phẩm gợi ý từ thuật toán SVD
export const getRecommendationsThunk = createAsyncThunk(
  "interaction/getRecommendations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/interaction/recommendations");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Fetch recommendations failed");
    }
  }
);

// =====================================================
// REDUX SLICE (QUẢN LÝ TRẠNG THÁI + LOCALSTORAGE)
// =====================================================
const interactionSlice = createSlice({
  name: "interaction",
  initialState: {
    recommendations: [],
    // 💾 Đọc dữ liệu đã lưu từ những phiên truy cập trước, tránh bị trắng trang khi F5
    recentlyViewed: JSON.parse(localStorage.getItem("veganic_recently_viewed")) || [], 
    loading: false,
    error: null,
  },
  reducers: {
    clearInteractionError: (state) => {
      state.error = null;
    },
    
    // Reducer đồng bộ: Thêm sản phẩm vào danh sách vừa xem ngay lập tức trên UI
    addToRecentlyViewed: (state, action) => {
      const product = action.payload; 
      if (!product || !product._id) return;
      
      // Lọc bỏ sản phẩm này nếu nó đã tồn tại trong danh sách trước đó để không bị trùng
      const filtered = state.recentlyViewed.filter(item => item._id !== product._id);
      
      // Đẩy sản phẩm vừa click lên đầu mảng, lưu tối đa 12 món để lướt slider mượt
      state.recentlyViewed = [product, ...filtered].slice(0, 12);

      // 💾 Đồng bộ ngay lập tức mảng mới vào localStorage để giữ data khi reload trang
      localStorage.setItem("veganic_recently_viewed", JSON.stringify(state.recentlyViewed));
    }
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
      })
      .addCase(getRecommendationsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRecommendationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload.data;
        state.error = null;
      })
      .addCase(getRecommendationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearInteractionError, addToRecentlyViewed } = interactionSlice.actions;
export default interactionSlice.reducer;