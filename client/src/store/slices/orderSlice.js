import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";


export const fetchMyOrders = createAsyncThunk(
  "order/fetchMyOrders",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/order/myorders");
      return res.data.orders;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const placeOrder = createAsyncThunk(
  "order/placeOrder",
  async (orderData, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/payment/create-session", orderData);

      if (res.data.url) {
        window.location.href = res.data.url;
      }
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Payment failed";
      toast.error(errorMsg);
      return thunkAPI.rejectWithValue(errorMsg);
    }
  }
);
const orderSlice = createSlice({
  name: "order",
  initialState: {
    myOrders: [],
    fetchingOrders: false,
    placingOrder: false, // USE FOR BUTTON
    activeStep: 0,
    shippingInfo: localStorage.getItem('shippingInfo')
      ? JSON.parse(localStorage.getItem('shippingInfo'))
      : {},
    error: null,
  },
  reducers: {
    setOrderStep: (state, action) => {
      state.activeStep = action.payload;
    },
    saveShippingInfo: (state, action) => {
      state.shippingInfo = action.payload;
      localStorage.setItem('shippingInfo', JSON.stringify(action.payload));
    },
    clearErrors: (state) => {
      state.error = null;
    },
    resetOrder: (state) => {
      state.activeStep = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.fetchingOrders = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.fetchingOrders = false;
        state.myOrders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state) => {
        state.fetchingOrders = false;
      })
      .addCase(placeOrder.pending, (state) => {
        state.placingOrder = true;
      })
      .addCase(placeOrder.fulfilled, (state) => {
        state.placingOrder = false;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.placingOrder = false;
        state.error = action.payload;
      });
  },
});

export const { setOrderStep, saveShippingInfo, clearErrors, resetOrder } = orderSlice.actions;
export default orderSlice.reducer;