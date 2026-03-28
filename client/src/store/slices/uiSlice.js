import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    isTomatoMode: false,
  },
  reducers: {
    toggleTomatoMode: (state) => {
      state.isTomatoMode = !state.isTomatoMode;
    },
  },
});

export const { toggleTomatoMode } = uiSlice.actions;
export default uiSlice.reducer;