import { createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios"; 
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

// Lấy danh sách sản phẩm (Đổi tên để khớp với Products.jsx gọi fetchAllProducts)
export const fetchAllProducts = () => async (dispatch) => {
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
    console.error("Fetch products error:", error);
  }
};

// Thêm sản phẩm mới
export const createNewProduct = (formData) => async (dispatch) => {
  dispatch(productRequest());
  try {
    const res = await axiosInstance.post("/product/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.data.success) {
      dispatch(productSuccess());
      toast.success(res.data.message || "Product added!");
      dispatch(fetchAllProducts()); // Refresh lại danh sách
    } else {
      dispatch(productFailed());
      toast.error(res.data.message);
    }
  } catch (error) {
    dispatch(productFailed());
    toast.error(error.response?.data?.message || "Error adding product.");
  }
};

// Cập nhật sản phẩm
export const updateProduct = (id, formData) => async (dispatch) => {
  dispatch(productRequest());
  try {
    const res = await axiosInstance.post(`/product/update/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.data.success) {
      dispatch(productSuccess());
      toast.success(res.data.message || "Product updated successfully!");
      dispatch(fetchAllProducts()); // Refresh lại danh sách
    } else {
      dispatch(productFailed());
      toast.error(res.data.message || "Update failed.");
    }
  } catch (error) {
    dispatch(productFailed());
    toast.error(error.response?.data?.message || "Error updating product.");
  }
};

/**
 * XÓA SẢN PHẨM (Hàm ní đang thiếu nè)
 */
export const deleteProduct = (id) => async (dispatch) => {
  dispatch(productRequest());
  try {
    const res = await axiosInstance.delete(`/product/delete/${id}`);

    if (res.data.success) {
      dispatch(productSuccess());
      toast.success(res.data.message || "Product removed from garden!");
      dispatch(fetchAllProducts()); // Refresh lại danh sách sau khi xóa
    } else {
      dispatch(productFailed());
      toast.error(res.data.message || "Delete failed.");
    }
  } catch (error) {
    dispatch(productFailed());
    toast.error(error.response?.data?.message || "Error deleting product.");
  }
};

export default productsSlice.reducer;