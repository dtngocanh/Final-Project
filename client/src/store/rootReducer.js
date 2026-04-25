import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import popupReducer from "./slices/popupSlice";
import cartReducer from "./slices/cartSlice";
import productReducer from "./slices/productSlice";
import orderReducer from "./slices/orderSlice";
import uiReducer from "./slices/uiSlice";
import aiReducer from "./slices/aiSlice";
import categoryReducer from "./slices/categorySlice";
import interactionReducer from "./slices/interactionSlice";
import addressReducer from "./slices/addressSlice";

const appReducer = combineReducers({
  auth: authReducer,
  popup: popupReducer,
  cart: cartReducer,
  product: productReducer,
  order: orderReducer,
  ui: uiReducer,
  ai: aiReducer,
  category: categoryReducer,
  interaction: interactionReducer,
  address: addressReducer
});

const rootReducer = (state, action) => {
  if (action.type === "RESET_APP") {
    state = undefined; // reset toàn bộ store
  }
  return appReducer(state, action);
};

export default rootReducer;