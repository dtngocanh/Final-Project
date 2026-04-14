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

export const handleProductClick = createAsyncThunk(
  "product/track-click",
  async ({ productId }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/product/track-click`, {
        productId,
      });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to track click.",
      );
    }
  },
);
// --- SLICE ---

const productSlice = createSlice({
  name: "product",
  initialState: {
    loading: false, // fetch
    reviewLoading: false,
    isUpdating: false, // update/post
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
    recipes: [],
  },
  reducers: {
    clearReviewState: (state) => {
      state.isSuccess = false;
    },
  },
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
      .addCase(postReview.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.isSuccess = true;
      })
      .addCase(postReview.rejected, (state) => {
        state.isUpdating = false;
        state.isSuccess = false;
      })

      //Update Review
      .addCase(updateReview.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.isSuccess = true;
      })
      .addCase(updateReview.rejected, (state, action) => {
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
      .addCase(fetchAllShopReviews.rejected, (state, action) => {
        state.reviewLoading = false;
      });
  },
});
export const { clearReviewState } = productSlice.actions;
export default productSlice.reducer;
