import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// 1. Thunk: Lấy dữ liệu Giỏ hàng khi vào App/tải lại trang
export const fetchCart = createAsyncThunk("cart/fetch", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get("/cart/get");
    // console.log(res.data.total_cart);

    return res.data; // Trả về { success: true, cartItems: [...], total_cart: ... }
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Fetch failed",
    );
  }
});


// 3. THÊM MỚI TẠI ĐÂY - Thunk: Thêm gói Combo giảm giá 10%
export const addComboToCart = createAsyncThunk(
  "cart/addCombo",
  async ({ mainProductId, comboProductIds }, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/cart/add-combo", {
        mainProductId,
        comboProductIds,
      });

      // Backend của bạn khi xử lý add-combo xong phải trả về cấu trúc chuẩn:
      // { success: true, cartItems: [...], total_cart: ... }
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Add combo failed",
      );
    }
  },
);

export const addToCartThunk = createAsyncThunk(
  "cart/add",
  async ({ productId, quantity }, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/cart/add", {
        productId,
        quantity,
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

export const removeFromCartThunk = createAsyncThunk(
  "cart/remove",
  async ({ productId }) => {
    // console.log(productId);

    const res = await axiosInstance.post("/cart/remove", {
      productId,
    });

    return res.data;
  },
);
export const updateQtyThunk = createAsyncThunk(
  "cart/updateQty",
  async ({ productId, change }) => {
    const res = await axiosInstance.post("/cart/update-qty", {
      productId,
      change,
    });

    return res.data;
  },
);

export const clearCartThunk = createAsyncThunk(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/cart/clear");
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  },
);

export const bulkAddCartThunk = createAsyncThunk(
  "cart/bulkAdd",
  async (items, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/cart/bulk-add", {
        items,
      });

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: [],
    loading: false,
    totalCart: 0,
  },
  reducers: {
    clearCart(state) {
      state.cart = [];
      state.totalCart = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cartItems || [];
        state.totalCart = action.payload.total_cart || 0;
      })
      .addCase(fetchCart.rejected, (state) => {
        state.loading = false;
      })

      .addCase(addComboToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addComboToCart.fulfilled, (state, action) => {
        state.loading = false;
        // Gom dữ liệu mới tinh từ Backend trả về đập thẳng vào State Redux
        state.cart = action.payload.cartItems || [];
        state.totalCart = action.payload.total_cart || 0;
      })
      .addCase(addComboToCart.rejected, (state) => {
        state.loading = false;
      })
      .addCase(bulkAddCartThunk.fulfilled, (state, action) => {
        state.cart = action.payload.cartItems;
      })
      .addCase(addToCartThunk.fulfilled, (state, action) => {
        state.cart = action.payload.cartItems;
        state.totalCart = action.payload.total_cart;
      })
      .addCase(removeFromCartThunk.fulfilled, (state, action) => {
        state.cart = action.payload.cartItems;
        state.totalCart = action.payload.total_cart;
      })
      .addCase(updateQtyThunk.fulfilled, (state, action) => {
        state.cart = action.payload.cartItems;
        state.totalCart = action.payload.total_cart;
      })
      .addCase(clearCartThunk.fulfilled, (state, action) => {
        state.cart = action.payload.cartItems;
        state.totalCart = action.payload.total_cart;
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
