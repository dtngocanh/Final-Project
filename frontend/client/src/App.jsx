import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastContainer, Slide } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
// Layout Components
import Navbar from "./components/Layout/Navbar";
import Sidebar from "./components/Layout/Sidebar";
import TomatoRain from "./components/Fruit/TomatoRain";
import SearchOverlay from "./components/Layout/SearchOverlay";
import CartSidebar from "./components/Layout/CartSidebar";
import ProfilePanel from "./components/Layout/ProfilePanel";
import LoginModal from "./components/Layout/LoginModal";
import Footer from "./components/Layout/Footer";

// Pages
import Index from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import MealPlans from "./pages/MealPlans";
import MealPlanDetail from "./pages/MealPlanDetail";
import PantryPage from "./pages/PantryPage";
import { useEffect } from "react";

import { getUser } from "./store/slices/authSlice";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import ScrollToTop from "./components/ScrollToTop";
import { fetchCart } from "./store/slices/cartSlice";
import OrderDetail from "./pages/OrdersDetails";
import ChatBot from "./components/Chat/Chatbot";
import RecipeDetail from "./pages/RecipeDetail";
import Recipes from "./pages/Recipes";
import AllRecipes from "./pages/AllRecipes";
import NotificationPage from "./pages/Notification";
import UserAnalytics from "./pages/UserAnalytics";
const App = () => {
  const { isTomatoMode } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    // 1. Luôn gọi getUser() ngay khi App load để check Cookie

    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    // 2. Chỉ khi đã có authUser (đã đăng nhập thành công) thì mới lấy giỏ hàng
    if (authUser) {
      dispatch(fetchCart());
    }
  }, [authUser, dispatch]);
  return (
    <>
      <ThemeProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen bg-white dark:bg-[#121212] transition-colors duration-500 ease-in-out">
            {isTomatoMode && <TomatoRain />}
            <Navbar />
            <Sidebar />
            <SearchOverlay />
            <CartSidebar />
            <ProfilePanel />
            <LoginModal />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/password/reset/:token" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/order/:id" element={<OrderDetail />} />
              <Route path="/success" element={<Success />} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/all-recipes" element={<AllRecipes />} />
              <Route path="/notifications" element={<NotificationPage />} />
              <Route path="/meal-plans" element={<MealPlans />} />
              <Route path="/meal-plan/:category" element={<MealPlanDetail />} />
              <Route path="/pantry" element={<PantryPage />} />
              <Route path="/my-analytics" element={<UserAnalytics />} />
            </Routes>
            <ChatBot />
            <Footer />
          </div>
          <ToastContainer
            position="bottom-right"
            autoClose={1500}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
};

export default App;
