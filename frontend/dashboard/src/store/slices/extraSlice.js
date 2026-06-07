import { createSlice } from "@reduxjs/toolkit";

const extraSlice = createSlice({
  name: "extra",
  initialState: {
    openedComponent: "Dashboard",
    isNavbarOpened: false,
    isViewProductModalOpened: false,
    isCreateProductModalOpened: false,
    isUpdateProductModalOpened: false,
    isImportProductModalOpened: false,

    isCreateCategoryModalOpened: false,
    isUpdateCategoryModalOpened: false,
    selectedCategory: null,
  },
  reducers: {
    toggleComponent: (state, action) => {
      state.openedComponent = action.payload;
    },
    toggleNavbar: (state) => {
      state.isNavbarOpened = !state.isNavbarOpened;
    },
    toggleCreateProductModal: (state) => {
      state.isCreateProductModalOpened = !state.isCreateProductModalOpened;
    },
    toggleViewProductModal: (state) => {
      state.isViewProductModalOpened = !state.isViewProductModalOpened;
    },
    toggleUpdateProductModal: (state) => {
      state.isUpdateProductModalOpened = !state.isUpdateProductModalOpened;
    },
    toggleImportProductModal: (state) => {
      state.isImportProductModalOpened = !state.isImportProductModalOpened;
    },

    // CATEGORY
    toggleCreateCategoryModal: (state) => {
      state.isCreateCategoryModalOpened = !state.isCreateCategoryModalOpened;
    },

    toggleUpdateCategoryModal: (state) => {
      state.isUpdateCategoryModalOpened = !state.isUpdateCategoryModalOpened;
    },

    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
  },
});

export const {
  toggleComponent,
  toggleNavbar,
  toggleCreateProductModal,
  toggleViewProductModal,
  toggleUpdateProductModal,
  toggleImportProductModal,

  toggleCreateCategoryModal,
  toggleUpdateCategoryModal,
  setSelectedCategory,
} = extraSlice.actions;

export default extraSlice.reducer;
