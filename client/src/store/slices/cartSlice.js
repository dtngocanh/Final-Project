import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";

export const updateCart = createAsyncThunk(
  "cart/update",
  async (cartItems, thunkAPI) => {
    try {
      // 1. Format dữ liệu (biến đổi từ object sang ID cho Backend)
      const formattedCart = cartItems.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      }));

      // 2. Gửi lên Server
      const res = await axiosInstance.post("/cart/update", { cartItems: formattedCart });

      // 3. Trả về chính cái cartItems ban đầu để Slice cập nhật State
      return cartItems;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);



export const fetchCart = createAsyncThunk("cart/fetch", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get("/cart/get");
    return res.data.cartItems;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Fetch failed";
    console.error(errorMessage);
    return thunkAPI.rejectWithValue(errorMessage);

  }
});



const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: [],
    loading: false
  },
  reducers: {
    // 1. Thêm sản phẩm vào giỏ
    addToCart(state, action) {
      const { product, quantity } = action.payload;
      const existingItem = state.cart.find(
        (item) => item.product._id === product._id
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cart.push({ product, quantity });
      }
    },

    // 2. Xóa sản phẩm khỏi giỏ
    removeFromCart(state, action) {
      state.cart = state.cart.filter(
        (item) => item.product._id !== action.payload.id
      );
    },

    // 3. Cập nhật số lượng (tăng/giảm)
    updateCartQuantity(state, action) {
      const item = state.cart.find(
        (item) => item.product._id === action.payload.id
      );
      if (item) {
        item.quantity += action.payload.quantity;

        // Bonus: Nếu số lượng về 0 thì xóa luôn cho sạch
        if (item.quantity <= 0) {
          state.cart = state.cart.filter(
            (i) => i.product._id !== action.payload.id
          );
        }
      }
    },

    //4.  Xóa sạch giỏ hàng
    clearCart(state) {
      state.cart = [];
    },

  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        // console.log("DEBUG: Cart Loading...");
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cart = action.payload || [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        // console.log("DEBUG: Cart Loading Failed:", action.payload);
      })
      .addCase(updateCart.fulfilled, (state, action) => {
        // Update state using sent data
        state.cart = action.payload;
      })
      ;
  },
});

// Export các actions để dùng ở Component
export const {
  clearCart, addToCart, removeFromCart, updateCartQuantity
} = cartSlice.actions;

// Export reducer để khai báo trong store
export default cartSlice.reducer;