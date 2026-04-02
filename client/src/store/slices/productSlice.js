import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// --- ASYNC THUNKS ---
// Connected API
export const fetchAllProducts = createAsyncThunk(
  "product/fetchAllProducts",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/product/list");
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch products."
      );
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  "product/singleProduct",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/product/${id}`);
      return res.data.product;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch product details."
      );
    }
  }
);

export const postReview = createAsyncThunk(
  "product/post-new/review",
  async ({ productId, review }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(
        `/product/post-new/review/${productId}`,
        review
      );
      toast.success(res.data.message);
      return res.data.review;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to post review.";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- SLICE ---

const productSlice = createSlice({
  name: "product",
  initialState: {
    loading: false,
    products: [],
    productDetails: {},
    totalProducts: 0,
    topRatedProducts: [],
    newProducts: [],
    aiSearching: false,
    isReviewDeleting: false,
    isPostingReview: false,
    productReviews: [],
  },
  reducers: {},
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
        state.productDetails = action.payload;
        // Nếu API trả về reviews kèm theo product
        state.productReviews = action.payload.reviews || [];
      })
      .addCase(fetchProductDetails.rejected, (state) => {
        state.loading = false;
      })

      // Post Review
      .addCase(postReview.pending, (state) => {
        state.isPostingReview = true;
      })
      .addCase(postReview.fulfilled, (state, action) => {
        state.isPostingReview = false;
        // Thêm review mới vào danh sách hiện tại
        state.productReviews.push(action.payload);
      })
      .addCase(postReview.rejected, (state) => {
        state.isPostingReview = false;
      });
  },
});

export default productSlice.reducer;