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
      const cleanCartItems = cartItems.map(item => ({
        product: item.product?._id || item.product, 
        quantity: item.quantity
      }));

      const response = await axiosInstance.post("/address/calc-fee", {
        cartItems: cleanCartItems,
        to_district_id: Number(to_district_id),
        to_ward_code: String(to_ward_code),
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
    loadingAddress: false,
    error: null,
    shippingFee: 0,
  },
  reducers: {
    resetDistricts: (state) => {
      state.districts = [];
      state.wards = [];
    },
    resetWards: (state) => {
      state.wards = [];
    },
    resetAddressState: (state) => {
      state.shippingFee = 0;
      state.districts = [];
      state.wards = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Provinces
      .addCase(fetchProvinces.pending, (state) => {
        state.loadingAddress = true;
      })
      .addCase(fetchProvinces.fulfilled, (state, action) => {
        state.loadingAddress = false;
        state.provinces = action.payload;
      })
      .addCase(fetchProvinces.rejected, (state, action) => {
        state.loadingAddress = false;
        state.error = action.payload;
      })
      // Fetch Districts
      .addCase(fetchDistricts.pending, (state) => {
        state.loadingAddress = true;
      })
      .addCase(fetchDistricts.fulfilled, (state, action) => {
        state.loadingAddress = false;
        state.districts = action.payload;
      })
      // Fetch Wards
      .addCase(fetchWards.pending, (state) => {
        state.loadingAddress = true;
      })
      .addCase(fetchWards.fulfilled, (state, action) => {
        state.loadingAddress = false;
        state.wards = action.payload;
      })

      .addCase(calcFee.fulfilled, (state, action) => {
        state.shippingFee = action.payload;
      });
  },
});

export const { resetDistricts, resetWards, resetAddressState } =
  addressSlice.actions;

export default addressSlice.reducer;