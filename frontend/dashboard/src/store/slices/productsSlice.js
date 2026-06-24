import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// --- ASYNC THUNKS (API Calls) ---

/**
 * @desc Fetch all products from the database
 */
export const fetchAllProducts = createAsyncThunk(
  "products/fetchAllProducts",
  async (params, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/admin/products", {
        params,
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
      const res = await axiosInstance.post("/admin/product", formData);
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
      const res = await axiosInstance.patch(`/admin/products/${id}`, formData);
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
      const res = await axiosInstance.delete(`/admin/products/${id}`);
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

/**
 * @desc Import products from Excel file
 */
export const importProducts = createAsyncThunk(
  "products/importProducts",
  async (file, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosInstance.post("/product/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Backend trả về res.data = { success, successCount, failedCount, errors, ... }
      if (res.data.success) {
        if (res.data.failedCount > 0) {
          // Trường hợp có dòng thành công, có dòng thất bại (do sai Category chẳng hạn)
          toast.warning(
            `Import xong: ${res.data.successCount} thành công, ${res.data.failedCount} lỗi.`,
          );
          console.table(res.data.errors); // Hiện bảng lỗi ở Console cho ní dễ soi
        } else {
          toast.success(
            `Hàng đã về vườn! Thành công ${res.data.successCount} sản phẩm.`,
          );
        }

        // Luôn fetch lại danh sách để cập nhật những món đã thành công
        thunkAPI.dispatch(fetchAllProducts());
        return res.data;
      } else {
        // Trường hợp file lỗi hoàn toàn hoặc logic backend chặn
        toast.error(res.data.message || "Import thất bại ní ơi!");
        return thunkAPI.rejectWithValue(res.data.message);
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Lỗi kết nối server rồi ní!";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const replenishProductStock = createAsyncThunk(
  "product/replenishStock",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/admin/products/replenish", {
        productId,
        quantity,
      });
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  },
);

export const restockProductLogs = createAsyncThunk(
  "product/restockLogs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/admin/products/restock-logs");
      console.log(response.data.logs);
      
      return response.data.logs;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
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
    restockLogs: [],
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

        // 🔥 ĐOẠN BỔ SUNG: Kiểm tra cấu trúc linh hoạt để tránh mảng rỗng []
        if (Array.isArray(action.payload)) {
          // Nếu Backend trả về mảng trực tiếp [...]
          state.products = action.payload;
        } else if (action.payload?.products && Array.isArray(action.payload.products)) {
          // Nếu Backend trả về dạng { products: [...] }
          state.products = action.payload.products;
        } else if (action.payload?.data && Array.isArray(action.payload.data)) {
          // Nếu Backend trả về dạng { data: [...] }
          state.products = action.payload.data;
        } else {
          // Fallback an toàn
          state.products = [];
        }

        // Giữ nguyên logic tính total ban đầu của ní nhưng bọc an toàn tránh crash
        state.totalProducts =
          action.payload?.totalProducts || action.payload?.products?.length || state.products.length || 0;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(replenishProductStock.fulfilled, (state, action) => {
        // Find the updated product in the state array
        const index = state.products.findIndex(
          (p) => p._id === action.payload._id,
        );
        // Replace old product data with the updated one
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })

      .addCase(restockProductLogs.pending, (state) => {
        state.loading = true;
      })

      .addCase(restockProductLogs.fulfilled, (state, action) => {
        state.restockLogs = action.payload;
      })
      .addCase(restockProductLogs.rejected, (state, action) => {
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