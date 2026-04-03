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

export const login = (data) => async (dispatch) => {
  dispatch(authRequest());
  try {
    const res = await axiosInstance.post("/seller/login", data);
    
    console.log("Response Data:", res.data);

    if (res.data.success) {
    
      dispatch(authSuccess({ email: data.email, role: "Seller" }));
    } else {
      dispatch(authFailed());
      toast.error(res.data.message || "Login failed");
    }
  } catch (err) { 
    dispatch(authFailed());
    
   
    console.error("Lỗi kết nối API:", err); 
    
    const msg = err.response?.data?.message || "Cannot connect to server";
    toast.error(msg);
  }
};

export const getUser = () => async (dispatch) => {
  dispatch(authRequest());
  try {
    const res = await axiosInstance.get("/seller/is-auth");
    if (res.data.success) {
      // ĐỔI TẠI ĐÂY: Giả định role Seller nếu token hợp lệ
      dispatch(authSuccess({ role: "Seller" }));
    } else {
      dispatch(authFailed());
    }
  } catch (error) {
    dispatch(authFailed());
  }
};

export const logout = () => async (dispatch) => {
  try {
    const res = await axiosInstance.get("/seller/logout");
    if (res.data.success) {
      dispatch(logoutSuccess());
      toast.success("Logged out");
    }
  } catch (error) {
    toast.error("Logout failed");
  }
};

export default authSlice.reducer;