import { createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios"; // Fixed with curly braces
import { toast } from "react-toastify";

const productsSlice = createSlice({
  name: "products",
  initialState: {
    loading: false,
    products: [],
    totalProducts: 0,
    product: null,
  },
  reducers: {
    productRequest: (state) => {
      state.loading = true;
    },
    productSuccess: (state) => {
      state.loading = false;
    },
    productFailed: (state) => {
      state.loading = false;
    },
    setAllProducts: (state, action) => {
      state.loading = false;
      state.products = action.payload;
    },
    setProductDetails: (state, action) => {
      state.loading = false;
      state.product = action.payload;
    },
  },
});

export const {
  productRequest,
  productSuccess,
  productFailed,
  setAllProducts,
  setProductDetails,
} = productsSlice.actions;

// --- THUNK ACTIONS ---

/**
 * Update Existing Product
 * Matches your UpdateProductModal.jsx requirement
 */
export const updateProduct = (id, formData) => async (dispatch) => {
  dispatch(productRequest());
  try {
    // Note: Ensure your backend has a PUT or POST route for full updates
    const res = await axiosInstance.post(`/product/update/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.data.success) {
      dispatch(productSuccess());
      toast.success(res.data.message || "Product updated successfully!");
      dispatch(getAllProducts()); // Refresh the list
    } else {
      dispatch(productFailed());
      toast.error(res.data.message || "Update failed.");
    }
  } catch (error) {
    dispatch(productFailed());
    toast.error(error.response?.data?.message || "Error updating product.");
  }
};

export const createNewProduct = (formData) => async (dispatch) => {
  dispatch(productRequest());
  try {
    const res = await axiosInstance.post("/product/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.data.success) {
      dispatch(productSuccess());
      toast.success(res.data.message || "Product added!");
      dispatch(getAllProducts());
    } else {
      dispatch(productFailed());
      toast.error(res.data.message);
    }
  } catch (error) {
    dispatch(productFailed());
    toast.error(error.response?.data?.message || "Error adding product.");
  }
};

export const getAllProducts = () => async (dispatch) => {
  dispatch(productRequest());
  try {
    const res = await axiosInstance.get("/product/list");
    if (res.data.success) {
      dispatch(setAllProducts(res.data.products));
    } else {
      dispatch(productFailed());
    }
  } catch (error) {
    dispatch(productFailed());
  }
};

export default productsSlice.reducer;