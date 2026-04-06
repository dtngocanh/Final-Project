import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// FETCH ALL ORDERS
export const fetchAllOrders = createAsyncThunk(
  "orders/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/orders");
      // toast.success(res.data.message);
      return res.data.orders; // API returns { success: true, orders: [...] }
    } catch (error) {
      const message = error.response?.data?.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  "orders/updateStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/order/update/${orderId}`, { status });
      return { orderId, status, data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearErrors: (state) => { state.error = null; },
    resetStatus: (state) => { state.success = false; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || []; 
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.success = true;
        const index = state.orders.findIndex(o => o._id === action.payload.orderId);
        if (index !== -1) {
          state.orders[index].orderStatus = action.payload.status;
        }
      });
  },
});

export const { clearErrors, resetStatus } = orderSlice.actions;
export default orderSlice.reducer;