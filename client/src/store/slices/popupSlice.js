import { createSlice } from "@reduxjs/toolkit";

const popupSlice = createSlice({
  name: "popup",
  initialState: {
    isAuthPopupOpen: false,
    isSidebarOpen: false,
    isSearchBarOpen: false,
    isCartOpen: false,
    isAIPopupOpen: false,
  },
  reducers: {
    toggleAuthPopup(state) {
      state.isAuthPopupOpen = !state.isAuthPopupOpen;
    },
    toggleSidebar(state) {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    closeSidebar(state) {
      state.isSidebarOpen = false;
    },
    toggleSearchBar(state) {
      state.isSearchBarOpen = !state.isSearchBarOpen;
    },
    toggleCart(state) {
      state.isCartOpen = !state.isCartOpen;
    },
    toggleAIModal(state) {
      state.isAIPopupOpen = !state.isAIPopupOpen;
    }
  },
});

export const {
  toggleAuthPopup,
  toggleSidebar,
  closeSidebar, 
  toggleSearchBar,
  toggleCart,
  toggleAIModal,
} = popupSlice.actions;

export default popupSlice.reducer;