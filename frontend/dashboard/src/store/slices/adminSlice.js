import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { axiosInstance } from "../../lib/axios";

// 1. Thunk: Lấy tất cả người dùng (Có phân trang)
export const fetchAllUsers = createAsyncThunk(
  "admin/fetchAllUsers",
  async ({ page = 1, search = "", role = "" }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/admin/users?page=${page}&search=${search}&role=${role}`,
      );
      return response.data; // Trả về dạng: { success, message, count, users: [...] }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Đã xảy ra lỗi");
    }
  },
);

// 2. Thunk: Xóa người dùng
export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(`/admin/users/delete/${id}`, {
        withCredentials: true,
      });
      toast.success(res.data.message);
      return res.data; // Trả về dạng: { success, message, id }
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa thất bại");
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

// 3. Thunk: Lấy thống kê Dashboard (Revenue, Growth, etc.)
export const fetchAdminDashboard = createAsyncThunk(
  "admin/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/admin/dashboard`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Xử lý Fetch Users ---
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        // Đã sửa từ action.payload.data thành action.payload.users cho khớp Controller
        state.users = action.payload.users; 
        state.totalUsers = action.payload.count;
      })
      .addCase(fetchAllUsers.rejected, (state) => {
        state.loading = false;
      })

      // --- Xử lý Delete User ---
      .addCase(deleteUser.fulfilled, (state, action) => {
        // Nhận vào action.payload.id từ backend trả về để filter chính xác
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