import { createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    loading: false,
    isAuthenticated: false,
    user: null,
  },
  reducers: {
    authRequest: (state) => {
      state.loading = true;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    authFailed: (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
    },
    logoutSuccess: (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { authRequest, authSuccess, authFailed, logoutSuccess } = authSlice.actions;

// --- Thunk Actions ---

// 1. LOGIN
export const login = (data) => async (dispatch) => {
  dispatch(authRequest());
  try {
    const res = await axiosInstance.post("/seller/login", data);
    if (res.data.success) {
      dispatch(authSuccess({ email: data.email, role: "Seller" }));
      toast.success("Login successful! Welcome back.");
    } else {
      dispatch(authFailed());
      toast.error(res.data.message || "Invalid credentials");
    }
  } catch (err) {
    dispatch(authFailed());
    toast.error(err.response?.data?.message || "Connection error");
  }
};

// 2. FORGOT PASSWORD (UI Placeholder)
export const forgotPassword = (data) => async (dispatch) => {
  dispatch(authRequest());
  try {
    
    const res = await axiosInstance.post("/seller/password/forgot", data);
    if (res.data.success) {
      toast.success("Recovery link sent to your email!");
    }
  } catch (err) {
    dispatch(authFailed());
    toast.error(err.response?.data?.message || "Failed to send recovery email");
  }
};

// 3. RESET PASSWORD (UI Placeholder)
export const resetPassword = ({ token, password, confirmPassword }) => async (dispatch) => {
  dispatch(authRequest());
  try {
    const res = await axiosInstance.put(`/seller/password/reset/${token}`, { password, confirmPassword });
    if (res.data.success) {
      toast.success("Password updated successfully!");
    }
  } catch (err) {
    dispatch(authFailed());
    toast.error(err.response?.data?.message || "Invalid or expired token");
  }
};

// 4. CHECK AUTH
export const getUser = () => async (dispatch) => {
  dispatch(authRequest());
  try {
    const res = await axiosInstance.get("/seller/is-auth");
    if (res.data.success) {
      dispatch(authSuccess({ role: "Seller" }));
    } else {
      dispatch(authFailed());
    }
  } catch (error) {
    dispatch(authFailed());
  }
};

// 5. LOGOUT
export const logout = () => async (dispatch) => {
  try {
    const res = await axiosInstance.get("/seller/logout");
    if (res.data.success) {
      dispatch(logoutSuccess());
      toast.success("Logged out successfully");
    }
  } catch (error) {
    toast.error("Logout failed");
  }
};

export default authSlice.reducer;