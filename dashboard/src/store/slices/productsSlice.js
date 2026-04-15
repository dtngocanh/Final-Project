import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// --- ASYNC THUNKS (API Calls) ---

/**
 * @desc Fetch all products from the database
 */
export const fetchAllProducts = createAsyncThunk(
  "products/fetchAllProducts",
  async (filterParams, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/product/list", {
        params: filterParams,
      });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch products.",
      );
    }
  },
);

/**
 * @desc Create a new product with multipart/form-data (images + json)
 */
export const createNewProduct = createAsyncThunk(
  "products/createNewProduct",
  async (formData, thunkAPI) => {
    console.log("Form Data Content:", Object.fromEntries(formData));
    try {
      const res = await axiosInstance.post("/product/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message || "Product added successfully!");

      // Re-fetch the list to keep UI in sync with Database
      thunkAPI.dispatch(fetchAllProducts());
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Error adding product.";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

/**
 * @desc Update existing product details and images
 * @param {Object} payload - Contains 'id' and 'formData'
 */
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, formData }, thunkAPI) => {
    try {      
      const res = await axiosInstance.patch(`/product/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message);

      thunkAPI.dispatch(fetchAllProducts());
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Error updating product.";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

/**
 * @desc Delete a product by its ID
 */
export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/product/delete/${id}`);
      toast.success(res.data.message || "Product removed!");
      thunkAPI.dispatch(fetchAllProducts());
      return id;
    } catch (error) {
      const message =
        error.response?.data?.message || "Error deleting product.";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// --- SLICE CONFIGURATION ---

const productsSlice = createSlice({
  name: "products",
  initialState: {
    loading: false,
    products: [],
    totalProducts: 0,
    error: null,
  },
  reducers: {
    // Standard synchronous reducers can go here
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle pending, fulfilled, and rejected states for all thunks
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        state.totalProducts =
          action.payload.totalProducts || action.payload.products?.length || 0;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Generic loading state for write operations (Create/Update/Delete)
      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") && action.type.includes("products/"),
        (state) => {
          state.loading = true;
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/fulfilled") ||
          action.type.endsWith("/rejected"),
        (state) => {
          state.loading = false;
        },
      );
  },
});

export const { clearError } = productsSlice.actions;
export default productsSlice.reducer;
