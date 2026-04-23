import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "http://localhost:4000/api/admin";

// 1. Thunk: Lấy tất cả người dùng (Có phân trang)
export const fetchAllUsers = createAsyncThunk(
  "admin/fetchAllUsers",
  async ({ page = 1, search = "", role = "" }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/users?page=${page}&search=${search}&role=${role}`,
        { withCredentials: true },
      ); //?page=${page}
      return response.data; // { success, message, count, data: [...] }
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  },
);

// 2. Thunk: Xóa người dùng
export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${API_URL}/users/delete/${id}`, {
        withCredentials: true,
      });
      toast.success(res.data.message)
      return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
      return rejectWithValue(error.response.data.message);
    }
  },
);

// 3. Thunk: Lấy thống kê Dashboard (Revenue, Growth, etc.)
export const fetchAdminDashboard = createAsyncThunk(
  "admin/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/dashboard`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  },
);

export const adminSlice = createSlice({
  name: "admin",
  initialState: {
    loading: false,
    totalUsers: 0,
    users: [],
    // Thống kê tài chính
    totalRevenueAllTime: 0,
    todayRevenue: 0,
    yesterdayRevenue: 0,
    revenueGrowth: "",
    // Thống kê người dùng
    totalUsersCount: 0,
    newUsersThisMonth: 0,
    // Biểu đồ & Sản phẩm
    monthlySales: [],
    currentMonthSales: 0,
    orderStatusCounts: {},
    topSellingProducts: [],
    lowStockProducts: 0,
  },
  reducers: {
    // Ní có thể thêm các reducer đồng bộ ở đây nếu cần
  },
  extraReducers: (builder) => {
    builder
      // --- Xử lý Fetch Users ---
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.totalUsers = action.payload.count;
      })
      .addCase(fetchAllUsers.rejected, (state) => {
        state.loading = false;
      })

      // --- Xử lý Delete User ---
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(
          (user) => user._id !== action.payload.id,
        );
      })

      // --- Xử lý Dashboard Data ---
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        const d = action.payload;
        state.totalRevenueAllTime = d.totalRevenueAllTime;
        state.todayRevenue = d.todayRevenue;
        state.yesterdayRevenue = d.yesterdayRevenue;
        state.revenueGrowth = d.revenueGrowth;
        state.totalUsersCount = d.totalUsersCount;
        state.newUsersThisMonth = d.newUsersThisMonth;
        state.monthlySales = d.monthlySales;
        state.orderStatusCounts = d.orderStatusCounts;
        state.topSellingProducts = d.topSellingProducts;
        state.lowStockProducts = d.lowStockProducts;
      });
  },
});

export default adminSlice.reducer;