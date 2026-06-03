import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// 1. FETCH ALL ORDERS (Admin/Seller)
export const fetchAllOrders = createAsyncThunk(
  "orders/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/orders");
      // Returns order array: { success: true, orders: [...] }
      return res.data.orders; 
    } catch (error) {
      const message = error.response?.data?.message || "Failed to load orders";
      return rejectWithValue(message);
    }
  }
);

// 2. UPDATE ORDER STATUS
// Receives object: { id: "...", status: "Shipped" }
export const updateOrderStatus = createAsyncThunk(
  "orders/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      // API call to update status
      const { data } = await axiosInstance.put(`/order/${id}`, { status });
      return { id, status, data };
    } catch (error) {
      const message = error.response?.data?.message || "Update failed";
      return rejectWithValue(message);
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
    clearErrors: (state) => {
      state.error = null;
    },
    resetStatus: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle updateOrderStatus
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        
        // UI SYNC: Find the order in the list and update status immediately
        const index = state.orders.findIndex((o) => o._id === action.payload.id);
        if (index !== -1) {
          state.orders[index].orderStatus = action.payload.status;

          // Logic: If Delivered, update delivery date and payment status for COD
          if (action.payload.status === "Delivered") {
            state.orders[index].deliveredAt = new Date().toISOString();
            if (state.orders[index].paymentInfo?.method === "COD") {
              state.orders[index].paymentInfo.status = "Paid";
            }
          }
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearErrors, resetStatus } = orderSlice.actions;
export default orderSlice.reducer;