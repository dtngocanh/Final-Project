import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";

export const sendMessage = createAsyncThunk("ai/sendMessage", async (message, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    
    // 1. Đồng bộ Session ID
    const sessionId = state.auth.authUser?._id || state.ai.currentSessionId || "guest";
    
    const res = await axiosInstance.post("/ai/chat", { 
      message, 
      session_id: sessionId // Node.js sẽ nhận cái này và forward sang FastAPI
    });
    
    // Backend trả về: { answer, products, session_id }
    return res.data; 
  } catch (error) {
    // 2. Bắt lỗi cụ thể hơn để UI hiển thị thân thiện
    let errorMessage = "System is a bit slow. Please try again later. 🌿";
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = "AI is thinking too long. Try a shorter question! 🐢";
    } else if (error.response?.data?.answer) {
      errorMessage = error.response.data.answer;
    }
    
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

const aiSlice = createSlice({
  name: "ai",
  initialState: { 
    messages: [], 
    isAsking: false, 
    error: null,
    currentSessionId: null 
  },
  reducers: {
    clearChat: (state) => { 
      state.messages = []; 
      state.error = null;
    },
    addUserMessage: (state, action) => {
      // Khi user bấm gửi, push tin nhắn user vào list ngay để tạo cảm giác mượt mà
      state.messages.push({ 
        role: 'user', 
        content: action.payload, 
        products: [] 
      });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => { 
        state.isAsking = true; 
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isAsking = false;
        
        // Cập nhật session_id nếu server trả về (quan trọng để giữ context)
        if (action.payload.session_id) {
          state.currentSessionId = action.payload.session_id;
        }

        // Push Bot Response vào chat bubble
        state.messages.push({ 
          role: 'bot', 
          content: action.payload.answer, 
          // Cực kỳ quan trọng: products này đã được Node.js/FastAPI làm sạch
          // Mỗi sản phẩm đã có sẵn { id, name, price, image, slug: id }
          products: action.payload.products || [] 
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isAsking = false;
        state.error = action.payload;

        // Hiển thị thông báo lỗi ngay trong giao diện chat để user biết
        state.messages.push({ 
          role: 'bot', 
          content: typeof action.payload === 'string' 
            ? action.payload 
            : "Connection error... Check your AI server. 🔌", 
          products: [] 
        });
      });
  },
});

export const { clearChat, addUserMessage } = aiSlice.actions;
export default aiSlice.reducer;