import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
export const fetchProvinces = createAsyncThunk(
  "address/fetchProvinces",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/address/provinces");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchDistricts = createAsyncThunk(
  "address/fetchDistricts",
  async (provinceId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/address/districts/${provinceId}`,
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchWards = createAsyncThunk(
  "address/fetchWards",
  async (districtId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/address/wards/${districtId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const calcFee = createAsyncThunk(
  "address/calcFee",
  async ({ cartItems, to_district_id, to_ward_code }, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/address/calc-fee", {
        cartItems,
        to_district_id,
        to_ward_code,
      });

      return response.data.feeUSD;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  },
);

const addressSlice = createSlice({
  name: "address",
  initialState: {
    provinces: [],
    districts: [],
    wards: [],
    loading: false,
    error: null,
    shippingFee: null,
  },
  reducers: {
    resetDistricts: (state) => {
      state.districts = [];
      state.wards = [];
    },
    resetWards: (state) => {
      state.wards = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Provinces
      .addCase(fetchProvinces.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProvinces.fulfilled, (state, action) => {
        state.loading = false;
        state.provinces = action.payload;
      })
      .addCase(fetchProvinces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Districts
      .addCase(fetchDistricts.fulfilled, (state, action) => {
        state.districts = action.payload;
      })
      // Fetch Wards
      .addCase(fetchWards.fulfilled, (state, action) => {
        state.wards = action.payload;
      })

      .addCase(calcFee.fulfilled, (state, action) => {
        state.shippingFee = action.payload;
      });
  },
});

export const { resetDistricts, resetWards } = addressSlice.actions;

export default addressSlice.reducer;
