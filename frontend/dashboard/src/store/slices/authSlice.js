import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// =======================
// LOGIN
export const login = createAsyncThunk(
  "auth/adminLogin",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/admin/login", data);

      toast.success(res.data.message);
      return res.data.user;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// =======================
// CHECK AUTH
export const getUser = createAsyncThunk(
  "auth/adminGetUser",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/admin/is-auth");
      toast.success("Welcome back!");
      return res.data.user;
    } catch (error) {
      // toast.error(error.response?.data?.message);
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// =======================
// LOGOUT
export const logout = createAsyncThunk(
  "auth/adminLogout",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/admin/logout");

      toast.success(res.data.message);
      return true;
    } catch (error) {
      const message = error.response?.data?.message || "Logout failed";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// =======================
//  FORGOT PASSWORD
export const forgotPassword = createAsyncThunk(
  "auth/adminForgotPassword",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/admin/password/forgot", data);
      toast.success("Recovery link sent to your email!");
      return true;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send email";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// =======================
// RESET PASSWORD
export const resetPassword = createAsyncThunk(
  "auth/adminResetPassword",
  async ({ token, password, confirmPassword }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/admin/password/reset/${token}`, {
        password,
        confirmPassword,
      });

      toast.success("Password updated successfully!");
      return true;
    } catch (error) {
      const message =
        error.response?.data?.message || "Invalid or expired token";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// =======================
// UPDATE PASSWORD

export const updatePassword = createAsyncThunk(
  "auth/password/update",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/admin/password/update`, data);
      toast.success(res.data.message);
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const fetchProfile = createAsyncThunk(
  "admin/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/profile");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

// =======================
// SLICE
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    isLoggingIn: false,
    isCheckingAuth: true,
    isLoading: false,

    isRequestingPassword: false,
    isResettingPassword: false,
    isUpdatingPassword: false,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder

      // LOGIN
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state) => {
        state.isLoggingIn = false;
        state.isAuthenticated = false;
      })

      // GET USER
      .addCase(getUser.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getUser.rejected, (state) => {
        state.isCheckingAuth = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })

      // FORGOT PASSWORD
      .addCase(forgotPassword.pending, (state) => {
        state.isRequestingPassword = true;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isRequestingPassword = false;
      })
      .addCase(forgotPassword.rejected, (state) => {
        state.isRequestingPassword = false;
      })

      // RESET PASSWORD
      .addCase(resetPassword.pending, (state) => {
        state.isResettingPassword = true;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isResettingPassword = false;
      })
      .addCase(resetPassword.rejected, (state) => {
        state.isResettingPassword = false;
      })

      // UPDATE PASSWORD
      .addCase(updatePassword.pending, (state) => {
        state.isUpdatingPassword = true;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.isUpdatingPassword = false;
        // state.user = action.payload.user;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.isUpdatingPassword = false;
      })

      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default authSlice.reducer;
