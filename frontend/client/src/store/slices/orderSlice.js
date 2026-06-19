import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";

// Các AsyncThunk hiện có của bạn
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
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Cannot Place Order",
      );
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
    placingOrder: false,
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
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const i = state.myOrders.findIndex((o) => o._id === action.payload);
        if (i !== -1) {
          state.myOrders[i].orderStatus = "Canceled";
        }
      });
  },
});

// --- SELECTOR CHO TỦ LẠNH ẢO ---
// Hàm này giúp lấy danh sách thực phẩm từ lịch sử đơn hàng
export const selectPantryItems = (state) => {
  const allOrders = state.order.myOrders;
  const pantryMap = new Map();

  allOrders.forEach((order) => {
    // Chỉ lấy sản phẩm từ đơn hàng đã hoàn tất
    if (order.orderStatus === "Delivered") {
      order.orderItems.forEach((item) => {
        const id = item.product?._id;
        if (!id) return;

        // Lưu sản phẩm và ngày mua gần nhất vào Map
        pantryMap.set(id, {
          ...item,
          shelfLifeDays: item.product?.shelfLifeDays || 7, // Lấy HSD từ DB
          addedAt: order.createdAt,
        });
      });
    }
  });

  return Array.from(pantryMap.values());
};

export const { setOrderStep, saveShippingInfo, clearErrors, resetOrder } = orderSlice.actions;
export default orderSlice.reducer;