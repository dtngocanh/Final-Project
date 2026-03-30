import { createSlice } from "@reduxjs/toolkit";
import { fetchCart, syncCartToDB } from "../thunks/cartThunks.js";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: [],
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

    // 4. Xóa sạch giỏ hàng
    clearCart(state) {
      state.cart = [];
    },

  },
  // 5. Xử lý cart
  extraReducers: (builder) => {
    builder

      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cart = action.payload || [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export các actions để dùng ở Component
export const {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart
} = cartSlice.actions;

// Export reducer để khai báo trong store
export default cartSlice.reducer;