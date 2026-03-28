import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios.js";
import {
  addToCart,
  removeFromCart,
  updateCartQuantity,
} from "../slices/cartSlice";

// FETCH CART
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/cart/get");
      return res.data.cartItems;
    } catch (error) {
      return thunkAPI.rejectWithValue("Fetch cart failed");
    }
  }
);

// SYNC CART
export const syncCartToDB = async (cart) => {
  return axiosInstance.post("/cart/update", {
    cartItems: cart,
  });
};

// ADD + SYNC
export const addToCartAndSync = (payload) => async (dispatch, getState) => {
  dispatch(addToCart(payload));

  const state = getState();
  const cart = state.cart.cart;

  await syncCartToDB(cart);
};

// UPDATE + SYNC
export const updateQuantityAndSync =
  (payload) => async (dispatch, getState) => {
    dispatch(updateCartQuantity(payload));

    const state = getState();
    const cart = state.cart.cart;

    await syncCartToDB(cart);
  };

// REMOVE + SYNC
export const removeFromCartAndSync =
  (payload) => async (dispatch, getState) => {
    dispatch(removeFromCart(payload));

    const state = getState();
    const cart = state.cart.cart;

    await syncCartToDB(cart);
  };


