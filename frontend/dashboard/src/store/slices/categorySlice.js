import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const fetchCategories = createAsyncThunk(
  "product/fetchCategories",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/admin/categories");
      return res.data.categories;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories.",
      );
    }
  },
);
export const createCategory = createAsyncThunk(
  "categories/create",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/admin/categories", data);

      toast.success("Category added");
      thunkAPI.dispatch(fetchCategories());

      return res.data;
    } catch (error) {
      const message = error.response?.data?.message;
      toast.error(message);

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axiosInstance.patch(
        `/admin/categories/${id}`,
        data
      );

      toast.success("Category updated");

      thunkAPI.dispatch(fetchCategories());

      return res.data;
    } catch (error) {
      const message = error.response?.data?.message;
      toast.error(message);

      return thunkAPI.rejectWithValue(message);
    }
  }
);
const categorySlice = createSlice({
  name: "category",
  initialState: {
    categories: [],
    isLoading: false,
    error: null,
    selectedCategory: "All", // Lưu ID hoặc "All"
  },
  reducers: {
    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setCategory } = categorySlice.actions;
export default categorySlice.reducer;
