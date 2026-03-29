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
  "order/new",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/order/new", data);
      toast.success(res.data.message);
      return res.data;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to place order");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    myOrders: [],
    fetchingOrders: false,
    placingOrder: false,
    finalPrice: null,
    orderStep: 1,
    paymentIntent: "",
  },
  reducers: {
    toggleOrderStep(state) {
      state.orderStep = 1;
    },
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
      // Logic chuẩn xác từ image_d2b11f.png
      .addCase(placeOrder.pending, (state) => {
        state.placingOrder = true;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.placingOrder = false;
        state.finalPrice = action.payload.total_price;
        state.paymentIntent = action.payload.paymentIntent;
        state.orderStep = 2;
      })
      .addCase(placeOrder.rejected, (state) => {
        state.placingOrder = false;
      });
  },
});

export const { toggleOrderStep } = orderSlice.actions;
export default orderSlice.reducer;