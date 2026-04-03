import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { toggleAuthPopup } from "./popupSlice";

// --- Async Thunks ---

export const register = createAsyncThunk("auth/register", async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.post("/user/register", data);
    toast.success(res.data.message);
    thunkAPI.dispatch(toggleAuthPopup());
    return res.data.user;
  } catch (error) {
    const message = error.response?.data?.message || "Registration failed";
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.post("/user/login", data);
    // if (res.data.token) localStorage.setItem("token", res.data.token);
    toast.success(res.data.message || "Login successful!");
    thunkAPI.dispatch(toggleAuthPopup());
    return res.data.user;
  } catch (error) {
    const message = error.response?.data?.message || "Login failed";
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

export const getUser = createAsyncThunk("auth/getUser", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get("/user/is-auth");
    return res.data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    await axiosInstance.get("/user/logout");
    toast.success("Logged out!");
    return null;
  } catch (error) {
    const message = error.response?.data?.message || "Logout failed";
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

export const forgotPassword = createAsyncThunk("auth/forgot/password", async (email, thunkAPI) => {
  try {
    // console.log(email);   //{email: ''}    
    const res = await axiosInstance.post(`/user/password/forgot?frontendUrl=http://localhost:5173`, email );
    toast.success(res.data.message);
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

export const resetPassword = createAsyncThunk("auth/password/reset", async ({ token, password, confirmPassword }, thunkAPI) => {
  try {
    const res = await axiosInstance.put(`/user/password/reset/${token}`, { password, confirmPassword });
    toast.success(res.data.message);
    return res.data.user;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong.";
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

export const updatePassword = createAsyncThunk("auth/password/update", async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.put(`/auth/password/update`, data);
    toast.success(res.data.message);
    return null;
  } catch (error) {
    const message = error.response?.data?.message;
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateProfile = createAsyncThunk("auth/me/update", async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.put(`/auth/profile/update`, data);
    toast.success(res.data.message);
    return res.data.user;
  } catch (error) {
    const message = error.response?.data?.message;
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

// --- Slice ---
const token = localStorage.getItem('token');
const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isUpdatingPassword: false,
    isRequestingForToken: false,
    isCheckingAuth: true,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 1. Register
      .addCase(register.pending, (state) => { state.isSigningUp = true; })
      .addCase(register.fulfilled, (state, action) => {
        state.isSigningUp = false;
        state.authUser = action.payload;
      })
      .addCase(register.rejected, (state) => { state.isSigningUp = false; })

      // 2. Login
      .addCase(login.pending, (state) => { state.isLoggingIn = true; })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.authUser = action.payload;
      })
      .addCase(login.rejected, (state) => { state.isLoggingIn = false; })

      // 3. Get User Profile
      .addCase(getUser.pending, (state) => { state.isCheckingAuth = true; })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.authUser = action.payload;
      })
      .addCase(getUser.rejected, (state) => {
        state.isCheckingAuth = false;
        state.authUser = null;
      })

      // 4. Logout
      .addCase(logout.fulfilled, (state) => {
        state.authUser = null;
      })

      // 5. Forgot Password
      .addCase(forgotPassword.pending, (state) => { state.isRequestingForToken = true; })
      .addCase(forgotPassword.fulfilled, (state) => { state.isRequestingForToken = false; })
      .addCase(forgotPassword.rejected, (state) => { state.isRequestingForToken = false; })

      // 6. Reset Password
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.authUser = action.payload;
      })

      // 7. Update Password
      .addCase(updatePassword.pending, (state) => { state.isUpdatingPassword = true; })
      .addCase(updatePassword.fulfilled, (state) => { state.isUpdatingPassword = false; })
      .addCase(updatePassword.rejected, (state) => { state.isUpdatingPassword = false; })

      // 8. Update Profile
      .addCase(updateProfile.pending, (state) => { state.isUpdatingProfile = true; })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isUpdatingProfile = false;
        state.authUser = action.payload;
      })
      .addCase(updateProfile.rejected, (state) => { state.isUpdatingProfile = false; });


  },

});

export default authSlice.reducer;