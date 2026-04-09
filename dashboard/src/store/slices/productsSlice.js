// import { createSlice } from "@reduxjs/toolkit";
// import { axiosInstance } from "../../lib/axios"; 
// import { toast } from "react-toastify";

// const productsSlice = createSlice({
//   name: "products",
//   initialState: {
//     loading: false,
//     products: [],
//     totalProducts: 0,
//     product: null,
//   },
//   reducers: {
//     productRequest: (state) => {
//       state.loading = true;
//     },
//     productSuccess: (state) => {
//       state.loading = false;
//     },
//     productFailed: (state) => {
//       state.loading = false;
//     },
//     setAllProducts: (state, action) => {
//       state.loading = false;
//       state.products = action.payload;
//     },
//     setProductDetails: (state, action) => {
//       state.loading = false;
//       state.product = action.payload;
//     },
//   },
// });

// export const {
//   productRequest,
//   productSuccess,
//   productFailed,
//   setAllProducts,
//   setProductDetails,
// } = productsSlice.actions;

// // --- THUNK ACTIONS ---

// // Lấy danh sách sản phẩm (Đổi tên để khớp với Products.jsx gọi fetchAllProducts)
// export const fetchAllProducts = () => async (dispatch) => {
//   dispatch(productRequest());
//   try {
//     const res = await axiosInstance.get("/product/list");
//     if (res.data.success) {
//       dispatch(setAllProducts(res.data.products));
//     } else {
//       dispatch(productFailed());
//     }
//   } catch (error) {
//     dispatch(productFailed());
//     console.error("Fetch products error:", error);
//   }
// };

// // Thêm sản phẩm mới
// export const createNewProduct = (formData) => async (dispatch) => {
//   dispatch(productRequest());
//   try {
//     const res = await axiosInstance.post("/product/add", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     if (res.data.success) {
//       dispatch(productSuccess());
//       toast.success(res.data.message || "Product added!");
//       dispatch(fetchAllProducts()); // Refresh lại danh sách
//     } else {
//       dispatch(productFailed());
//       toast.error(res.data.message);
//     }
//   } catch (error) {
//     dispatch(productFailed());
//     toast.error(error.response?.data?.message || "Error adding product.");
//   }
// };

// // Cập nhật sản phẩm
// export const updateProduct = (id, formData) => async (dispatch) => {
//   dispatch(productRequest());
//   try {
//     const res = await axiosInstance.post(`/product/update/${id}`, formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });

//     if (res.data.success) {
//       dispatch(productSuccess());
//       toast.success(res.data.message || "Product updated successfully!");
//       dispatch(fetchAllProducts()); // Refresh lại danh sách
//     } else {
//       dispatch(productFailed());
//       toast.error(res.data.message || "Update failed.");
//     }
//   } catch (error) {
//     dispatch(productFailed());
//     toast.error(error.response?.data?.message || "Error updating product.");
//   }
// };

// /**
//  * XÓA SẢN PHẨM (Hàm ní đang thiếu nè)
//  */
// export const deleteProduct = (id) => async (dispatch) => {
//   dispatch(productRequest());
//   try {
//     const res = await axiosInstance.delete(`/product/delete/${id}`);

//     if (res.data.success) {
//       dispatch(productSuccess());
//       toast.success(res.data.message || "Product removed from garden!");
//       dispatch(fetchAllProducts()); // Refresh lại danh sách sau khi xóa
//     } else {
//       dispatch(productFailed());
//       toast.error(res.data.message || "Delete failed.");
//     }
//   } catch (error) {
//     dispatch(productFailed());
//     toast.error(error.response?.data?.message || "Error deleting product.");
//   }
// };

// export default productsSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// --- ASYNC THUNKS (API Calls) ---

/**
 * @desc Fetch all products from the database
 */
export const fetchAllProducts = createAsyncThunk(
  "products/fetchAllProducts",
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
  }
);

/**
 * @desc Update existing product details and images
 * @param {Object} payload - Contains 'id' and 'formData'
 */
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, formData }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/product/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message || "Product updated successfully!");
      
      thunkAPI.dispatch(fetchAllProducts());
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Error updating product.";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
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
      const message = error.response?.data?.message || "Error deleting product.";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
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
    }
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
        state.totalProducts = action.payload.totalProducts || action.payload.products?.length || 0;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Generic loading state for write operations (Create/Update/Delete)
      .addMatcher(
        (action) => action.type.endsWith("/pending") && action.type.includes("products/"),
        (state) => { state.loading = true; }
      )
      .addMatcher(
        (action) => action.type.endsWith("/fulfilled") || action.type.endsWith("/rejected"),
        (state) => { state.loading = false; }
      );
  },
});

export const { clearError } = productsSlice.actions;
export default productsSlice.reducer;