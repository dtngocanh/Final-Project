import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";

export const sendMessage = createAsyncThunk("ai/sendMessage", async (message, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    // Use auth ID or a stored guest session ID
    const sessionId = state.auth.authUser?._id || state.ai.currentSessionId || "guest";
    
    // Match the payload expected by your Node.js/Python backend
    const res = await axiosInstance.post("/ai/chat", { 
      message, 
      session_id: sessionId 
    });
    
    return res.data; // Expected: { answer, products, session_id }
  } catch (error) {
    // Return specific error message from server or a default English fallback
    const errorMessage = error.response?.data?.answer || "System is a bit slow. Please try again later. 🌿";
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

const aiSlice = createSlice({
  name: "ai",
  initialState: { 
    messages: [], 
    isAsking: false, 
    error: null,
    currentSessionId: null // Track session returned by server
  },
  reducers: {
    clearChat: (state) => { 
      state.messages = []; 
      state.error = null;
    },
    addUserMessage: (state, action) => {
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
        
        // Update session ID if provided by backend
        if (action.payload.session_id) {
          state.currentSessionId = action.payload.session_id;
        }

        // Push Bot Response
        state.messages.push({ 
          role: 'bot', 
          content: action.payload.answer || "I've analyzed your request.", 
          // Ensure products is always an array to prevent .map() crashes on UI
          products: Array.isArray(action.payload.products) ? action.payload.products : [] 
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isAsking = false;
        state.error = action.payload;

        // Add an error message to the chat bubble so the user sees what happened
        state.messages.push({ 
          role: 'bot', 
          content: typeof action.payload === 'string' 
            ? action.payload 
            : "Connection error... Please check your AI server. 🌿", 
          products: [] 
        });
      });
  },
});

export const { clearChat, addUserMessage } = aiSlice.actions;
export default aiSlice.reducer;