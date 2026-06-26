import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// --- ASYNC THUNKS (API Calls) ---

export const fetchAllCampaigns = createAsyncThunk(
  "campaigns/fetchAllCampaigns",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/campaign");
      return res.data.data; 
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to retrieve the campaign list."
      );
    }
  }
);

export const createNewCampaign = createAsyncThunk(
  "campaigns/createNewCampaign",
  async (campaignData, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/campaign", campaignData);
      toast.success("Campaign created successfully!");
      thunkAPI.dispatch(fetchAllCampaigns());
      return res.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create campaign.";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

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
    isOpenModal: false,
    isEditing: false,
    formData: {
      name: "",
      discountPercent: "",
      saleLimit: 0,
      targetType: "category",
      product: "",
      category: "",
      startTime: "",
      endTime: "",
    },
  },
  reducers: {
    clearCampaignError: (state) => {
      state.error = null;
    },
    
    // Action cho sản phẩm
    openModalWithProduct: (state, action) => {
      const product = action.payload;
      state.formData = {
        name: "",
        discountPercent: "", 
        saleLimit: 0,
        targetType: "product", 
        product: product._id,  
        category: "",
        startTime: "",
        endTime: "",
      };
      state.isEditing = false;
      state.isOpenModal = true;
    },

    // --- ĐÃ THÊM: Action điền nhanh Category và mở Modal y như Product ---
    openModalWithCategory: (state, action) => {
      const categoryObj = action.payload; // Nhận về object chứa thông tin danh mục
      state.formData = {
        name: "",
        discountPercent: "",
        saleLimit: 0,
        targetType: "category",       // Ép scope chọn toàn bộ Danh mục
        product: "",                  // Xóa trống mục sản phẩm
        category: categoryObj._id,    // Gán ID danh mục nhận được từ payload
        startTime: "",
        endTime: "",
      };
      state.isEditing = false;
      state.isOpenModal = true;
    },

    updateCampaignFormData: (state, action) => {
      const { name, value } = action.payload;
      state.formData[name] = value;
    },

    closeCampaignModal: (state) => {
      state.isOpenModal = false;
      state.isEditing = false;
      state.formData = {
        name: "",
        discountPercent: "",
        saleLimit: 0,
        targetType: "category",
        product: "",
        category: "",
        startTime: "",
        endTime: "",
      };
    },
    
    openEmptyCampaignModal: (state) => {
      state.isEditing = false;
      state.isOpenModal = true;
    },

    openEditCampaignModal: (state, action) => {
      state.formData = action.payload;
      state.isEditing = true;
      state.isOpenModal = true;
    }
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(createNewCampaign.fulfilled, (state) => {
        state.isOpenModal = false;
      })
      .addCase(updateCampaign.fulfilled, (state) => {
        state.isOpenModal = false;
      })
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

// Nhớ export hàm mới ở dưới này ra nhé!
export const { 
  clearCampaignError, 
  openModalWithProduct, 
  openModalWithCategory, // <-- Đã xuất ra đây để sử dụng
  updateCampaignFormData, 
  closeCampaignModal,
  openEmptyCampaignModal,
  openEditCampaignModal
} = campaignsSlice.actions;

export default campaignsSlice.reducer;