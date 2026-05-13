import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";

export const fetchMyOrders = createAsyncThunk(
  "order/fetchMyOrders",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/order/user");
      return res.data.orders;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);
export const fetchOrderDetails = createAsyncThunk(
  "order/fetchOrderDetails",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/order/${id}`);
      return res.data.order;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const placeOrder = createAsyncThunk(
  "order/placeOrder",
  async (orderData, thunkAPI) => {
    try {
      const isCOD = orderData.paymentMethod === "COD";

      const endpoint = isCOD ? "/order/new" : "/payment/create-session";

      const res = await axiosInstance.post(endpoint, orderData);

      if (!isCOD && res.data.url) {
        window.location.href = res.data.url;
      } else if (isCOD) {
        return res.data;
      }
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Payment failed";
      toast.error(errorMsg);
      return thunkAPI.rejectWithValue(errorMsg);
    }
  },
);

export const cancelOrder = createAsyncThunk(
  "order/cancelOrder",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/order/cancel", { orderId: id });
      if (res.data.success) {
        return id;
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Something went wrong",
      );
    }
  },
);


const orderSlice = createSlice({
  name: "order",
  initialState: {
    myOrders: [],
    fetchingOrders: false,
    placingOrder: false, // USE FOR BUTTON
    activeStep: 0,
    shippingInfo: localStorage.getItem("shippingInfo")
      ? JSON.parse(localStorage.getItem("shippingInfo"))
      : {},
    error: null,
    orderDetail: null,

  },
  reducers: {
    setOrderStep: (state, action) => {
      state.activeStep = action.payload;
    },
    saveShippingInfo: (state, action) => {
      state.shippingInfo = action.payload;
      localStorage.setItem("shippingInfo", JSON.stringify(action.payload));
    },
    clearErrors: (state) => {
      state.error = null;
    },
    resetOrder: (state) => {
      state.activeStep = 0;
      state.shippingInfo = {};
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

      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.orderDetail = action.payload;
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
      })
      // Handle successful order cancellation
      .addCase(cancelOrder.fulfilled, (state, action) => {
        //Find the index of the cancelled order in the local state
        const i = state.myOrders.findIndex((o) => o._id === action.payload);
        // If found, update its status locally to reflect changes immediately
        if (i !== -1) {
          state.myOrders[i].orderStatus = "Canceled";
        }
      })
;
  },
});

export const { setOrderStep, saveShippingInfo, clearErrors, resetOrder } =
  orderSlice.actions;
export default orderSlice.reducer;
