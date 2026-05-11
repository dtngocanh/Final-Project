import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// --- ASYNC THUNKS ---
// Connected API
export const fetchAllProducts = createAsyncThunk(
  "product/fetchAllProducts",
  async (fileterParams, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/product/list", {
        params: fileterParams,
      });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch products.",
      );
    }
  },
);

export const fetchProductDetails = createAsyncThunk(
  "product/singleProduct",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/product/${id}`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch product details.",
      );
    }
  },
);

export const postReview = createAsyncThunk(
  "product/post-new/review",
  async (reviewData, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/user/review`, reviewData);
      toast.success(res.data.message);
      return null;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to post review.";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const updateReview = createAsyncThunk(
  "product/put-new/review",
  async (reviewData, thunkAPI) => {
    try {
      console.log(reviewData);
      const res = await axiosInstance.put(`/user/review`, reviewData);
      toast.success(res.data.message);
      return null;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to post review.";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const fetchAllShopReviews = createAsyncThunk(
  "product/get-new/review",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/user/review`);
      // toast.success(res.data.message);
      return res.data.reviews;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to post review.";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// export const handleProductClick = createAsyncThunk(
//   "product/track-click",
//   async ({ productId }, thunkAPI) => {
//     try {
//       const res = await axiosInstance.post(`/product/track-click`, {
//         productId,
//       });
//       return res.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || "Failed to track click.",
//       );
//     }
//   },
// );
// --- SLICE ---

// --- Related product ---
// Gọi API lấy sản phẩm liên quan từ mảng ID đã có trong DB
export const fetchRelatedProducts = createAsyncThunk(
  "product/fetchRelatedProducts",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/product/related-v2/${id}`);
      return res.data; // Trả về { success: true, related: [...] }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch related products.",
      );
    }
  },
);
// Freq product
export const fetchFreqProducts = createAsyncThunk(
  "product/fetchFreqProducts",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/product/freq/${id}`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const searchProducts = createAsyncThunk(
  "product/searchProducts",
  async (fileterParams, thunkAPI) => {
    try {
      // Gửi keyword qua query parameter (?q=...)
      const res = await axiosInstance.get(`/product/search`, {
        params: fileterParams,
      });
      console.log("Dữ liệu từ API:", res.data);
      return res.data;
    } catch (error) {
      // Trả về lỗi từ backend hoặc lỗi mặc định
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Search failed",
      );
    }
  },
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    loading: false,
    reviewLoading: false,
    isUpdating: false,
    products: [],
    productDetails: {},
    totalProducts: 0,
    topRatedProducts: [],
    newProducts: [],
    aiSearching: false,
    isReviewDeleting: false,
    productReviews: [],
    allShopReviews: [],
    isSuccess: false,
    relatedProducts: [],
    freqProducts: [],
    isLoadingFreq: false,
    freqError: null,
    recipes: [],
    loadingSearch: false,
    searchSug: [],
  },
  // --- REDUCERS (Đồng bộ) ---
  reducers: {
    clearReviewState: (state) => {
      state.isSuccess = false;
    },
    clearFreqProducts: (state) => {
      state.freqProducts = [];
    },
    clearSearchResults: (state) => {
      state.searchSug = [];
    },
  },
  // --- EXTRA REDUCERS (Bất đồng bộ - PHẢI NẰM NGOÀI NÀY) ---
  extraReducers: (builder) => {
    builder
      // Fetch All Products
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.newProducts = action.payload.newProducts;
        state.topRatedProducts = action.payload.topRatedProducts;
        state.totalProducts = action.payload.totalProducts;
      })
      .addCase(fetchAllProducts.rejected, (state) => {
        state.loading = false;
      })

      // Fetch Product Details
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.productDetails = action.payload.product;
        state.relatedProducts = action.payload.related;
        state.recipes = action.payload.recipes;
        state.productReviews = action.payload.product.reviews || [];
      })
      .addCase(fetchProductDetails.rejected, (state) => {
        state.loading = false;
      })

      // Post Review
      .addCase(postReview.pending, (state) => {
        state.isUpdating = true;
        state.isSuccess = false;
      })
      .addCase(postReview.fulfilled, (state) => {
        state.isUpdating = false;
        state.isSuccess = true;
      })
      .addCase(postReview.rejected, (state) => {
        state.isUpdating = false;
        state.isSuccess = false;
      })

      // Update Review
      .addCase(updateReview.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(updateReview.fulfilled, (state) => {
        state.isUpdating = false;
        state.isSuccess = true;
      })
      .addCase(updateReview.rejected, (state) => {
        state.isUpdating = false;
      })

      // Fetch All Shop Review
      .addCase(fetchAllShopReviews.pending, (state) => {
        state.reviewLoading = true;
      })
      .addCase(fetchAllShopReviews.fulfilled, (state, action) => {
        state.reviewLoading = false;
        state.allShopReviews = action.payload;
      })
      .addCase(fetchAllShopReviews.rejected, (state) => {
        state.reviewLoading = false;
      })

      // Fetch related product
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.relatedProducts = action.payload.related;
      })
      .addCase(fetchRelatedProducts.rejected, (state) => {
        state.relatedProducts = [];
      })

      // Fetch freq product
      .addCase(fetchFreqProducts.pending, (state) => {
        state.isLoadingFreq = true;
      })
      .addCase(fetchFreqProducts.fulfilled, (state, action) => {
        state.isLoadingFreq = false;
        state.freqProducts = action.payload.frequentlyBoughtTogether || [];
      })
      .addCase(fetchFreqProducts.rejected, (state, action) => {
        state.isLoadingFreq = false;
        state.freqError = action.payload;
      })
      .addCase(searchProducts.pending, (state) => {
        state.loadingSearch = true;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loadingSearch = false;
        state.searchSug = action.payload;
        state.products = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loadingSearch = false;
      });
  },
});

export const { clearReviewState, clearFreqProducts, clearSearchResults } =
  productSlice.actions;
export default productSlice.reducer;
