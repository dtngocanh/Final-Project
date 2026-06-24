import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// --- ASYNC THUNKS (API Calls) ---

// 1. Fetch all campaigns (Backend populates product/category descriptors automatically)
export const fetchAllCampaigns = createAsyncThunk(
  "campaigns/fetchAllCampaigns",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/campaign");
      // Expected payload format: { success: true, data: [...] }
      return res.data.data; 
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to retrieve the campaign list."
      );
    }
  }
);

// 2. Create a new campaign (Forwards local form configuration including saleLimit constraints)
export const createNewCampaign = createAsyncThunk(
  "campaigns/createNewCampaign",
  async (campaignData, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/campaign", campaignData);
      toast.success("Campaign created successfully!");
      
      // Re-synchronize remote changes into local client store context
      thunkAPI.dispatch(fetchAllCampaigns());
      return res.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create campaign.";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 3. Update an existing campaign configurations
export const updateCampaign = createAsyncThunk(
  "campaigns/updateCampaign",
  async ({ id, campaignData }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/campaign/${id}`, campaignData);
      toast.success("Campaign configuration updated successfully!");

      thunkAPI.dispatch(fetchAllCampaigns());
      return res.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update campaign details.";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 4. Delete a campaign item
export const deleteCampaign = createAsyncThunk(
  "campaigns/deleteCampaign",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/campaign/${id}`);
      toast.success(res.data.message || "Campaign removed successfully!");
      
      thunkAPI.dispatch(fetchAllCampaigns());
      return id;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to remove campaign.";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 5. Force Manual Override Override Engine (Trigger start/end schedules manually)
export const triggerManualDiscount = createAsyncThunk(
  "campaigns/triggerManualDiscount",
  async ({ id, action }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/campaign/test-trigger/${id}?action=${action}`);
      toast.success(res.data.message || `Campaign status modified successfully to: ${action}`);
      
      thunkAPI.dispatch(fetchAllCampaigns());
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to enforce manual status update.";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- SLICE CONFIGURATION ---

const campaignsSlice = createSlice({
  name: "campaigns",
  initialState: {
    loading: false,
    campaigns: [],
    error: null,
  },
  reducers: {
    clearCampaignError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetching lifecycle handling
      .addCase(fetchAllCampaigns.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload || []; 
      })
      .addCase(fetchAllCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Centralized loading automation selectors across mutations (Create / Update / Delete / Force status toggle triggers)
      .addMatcher(
        (action) => action.type.startsWith("campaigns/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
        }
      )
      .addMatcher(
        (action) => 
          action.type.startsWith("campaigns/") && 
          (action.type.endsWith("/fulfilled") || action.type.endsWith("/rejected")),
        (state) => {
          state.loading = false;
        }
      );
  },
});

export const { clearCampaignError } = campaignsSlice.actions;
export default campaignsSlice.reducer;