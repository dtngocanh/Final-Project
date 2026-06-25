import React, { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

// 1. CÁC TÌNH HUỐNG LAYOUT/UI CHUNG: Giữ lại import tĩnh vì trang nào cũng dùng
import Navbar from "./components/Layout/Navbar";
import Sidebar from "./components/Layout/Sidebar";
import TomatoRain from "./components/Fruit/TomatoRain";
import SearchOverlay from "./components/Layout/SearchOverlay";
import CartSidebar from "./components/Layout/CartSidebar";
import ProfilePanel from "./components/Layout/ProfilePanel";
import LoginModal from "./components/Layout/LoginModal";
import Footer from "./components/Layout/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ChatBot from "./components/Chat/Chatbot";

// Slices
import { getUser } from "./store/slices/authSlice";
import { fetchCart } from "./store/slices/cartSlice";

// 2. CHUYỂN TOÀN BỘ PAGES SANG LAZY LOADING
const Index = lazy(() => import("./pages/Home"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Orders = lazy(() => import("./pages/Orders"));
const About = lazy(() => import("./pages/About"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MealPlans = lazy(() => import("./pages/MealPlans"));
const MealPlanDetail = lazy(() => import("./pages/MealPlanDetail"));
const PantryPage = lazy(() => import("./pages/PantryPage"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Success = lazy(() => import("./pages/Success"));
const OrderDetail = lazy(() => import("./pages/OrdersDetails"));
const RecipeDetail = lazy(() => import("./pages/RecipeDetail"));
const Recipes = lazy(() => import("./pages/Recipes"));
const AllRecipes = lazy(() => import("./pages/AllRecipes"));
const NotificationPage = lazy(() => import("./pages/Notification"));
const UserAnalytics = lazy(() => import("./pages/UserAnalytics"));
const ReviewOrderPage = lazy(() => import("./pages/ReviewOrder"));

// Hiệu ứng chờ khi chuyển trang (Bạn có thể custom thành Spinner đẹp hơn)
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#121212] text-gray-500">
    Loading page...
  </div>
);

const App = () => {
  const { isTomatoMode } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (authUser) {
      dispatch(fetchCart());
    }
  }, [authUser, dispatch]);

  return (
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

          {/* 3. BẮT BUỘC BỌC <Routes> VÀO <Suspense> */}
          <Suspense fallback={<PageLoader />}>
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
              <Route path="/review-order/:id" element={<ReviewOrderPage />} />
            </Routes>
          </Suspense>

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
  );
};

export default App;