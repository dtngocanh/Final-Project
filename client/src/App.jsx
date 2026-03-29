import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastContainer } from "react-toastify";
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
import Payment from "./pages/Payment";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { fetchCart } from "./store/thunks/cartThunks";

const App = () => {
  const { isTomatoMode } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    if (authUser) {
      dispatch(fetchCart());
    }
  }, [authUser, dispatch]);

  return (
    <>
      <ThemeProvider>
        <BrowserRouter>
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
              <Route path="/payment" element={<Payment />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </div>
          <ToastContainer
            position="bottom-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
};

export default App;
