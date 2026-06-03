import { Menu, ShoppingBag, Sun, Moon, Search, User, Bell } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleAuthPopup,
  toggleCart,
  toggleSearchBar,
  toggleSidebar,
} from "../../store/slices/popupSlice";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cart } = useSelector((state) => state.cart);
  
  // TỐI ƯU UX: Cộng dồn tổng số lượng thực tế của tất cả sản phẩm trong giỏ hàng
  const cartItemsCount = cart
    ? cart.reduce((total, item) => total + (item.quantity || 1), 0)
    : 0;

  // MÀU SẮC CHUẨN TỪ FOOTER
  const darkGreenLight = "#77cd3af2"; // Xanh lá sáng (Neon nhẹ)
  const lightGreenDark = "#025c37"; // Xanh lá đậm
  const activeColor = theme === "dark" ? darkGreenLight : lightGreenDark;

  return (
    <nav className="sticky top-0 z-50 w-full transition-all duration-500 bg-white/80 dark:bg-[#061211]/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* 1. LEFT: MENU & LOGO */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle Menu"
          >
            <Menu size={24} strokeWidth={1.5} style={{ color: activeColor }} />
          </button>

          <a href="/" className="flex items-center gap-1 group">
            <img
              src={theme === "dark" ? "/logohaha1.png" : "/logohaha.png"}
              alt="logo"
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain transition-transform duration-500 group-hover:scale-105"
            />
            <span
              className="font-serif italic text-xl sm:text-2xl tracking-tighter drop-shadow-[0_0_8px_rgba(119,205,58,0.3)] select-none"
              style={{ color: activeColor }}
            >
              Veganic
            </span>
          </a>
        </div>

        {/* 2. RIGHT: ACTIONS */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          {/* Search */}
          <button
            onClick={() => dispatch(toggleSearchBar())}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all hover:scale-105"
            aria-label="Search"
          >
            <Search size={20} strokeWidth={2} style={{ color: activeColor }} />
          </button>

          {/* Theme Toggle - Ẩn trên Mobile, hiện từ Tablet trở lên */}
          <button
            onClick={toggleTheme}
            className="hidden sm:inline-flex p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all hover:scale-105"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun size={20} strokeWidth={2} className="text-yellow-400" />
            ) : (
              <Moon size={20} strokeWidth={2} style={{ color: activeColor }} />
            )}
          </button>

          {/* Bell Notifications - Ẩn trên Mobile, hiện từ Tablet trở lên */}
          <button
            onClick={() => navigate("/notifications")}
            className="hidden sm:inline-flex relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all hover:scale-105"
            aria-label="Notifications"
          >
            <Bell size={20} strokeWidth={2} style={{ color: activeColor }} />
          </button>

          {/* Shopping Cart - Tối ưu Badge không chớp, tự co giãn theo độ dài số */}
          <button
            onClick={() => dispatch(toggleCart())}
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all hover:scale-105 group"
            aria-label="Cart"
          >
            <ShoppingBag
              size={21}
              strokeWidth={2}
              style={{ color: activeColor }}
              className="transition-transform group-hover:scale-110"
            />
            {cartItemsCount > 0 && (
              <span
                className="absolute top-1 right-1 text-[10px] font-bold text-white min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full shadow-md select-none pointer-events-none"
                style={{ backgroundColor: activeColor }}
              >
                {cartItemsCount}
              </span>
            )}
          </button>

          {/* User Profile - Bo viền mờ, ẩn trên Mobile, hiện từ Desktop trở lên */}
          <button
            onClick={() => dispatch(toggleAuthPopup())}
            className="hidden md:flex ml-1 items-center justify-center w-9 h-9 rounded-full border transition-all hover:bg-gray-100 dark:hover:bg-white/5"
            style={{
              borderColor:
                theme === "dark"
                  ? "rgba(119, 205, 58, 0.2)"
                  : "rgba(2, 92, 55, 0.2)",
              color: activeColor,
            }}
            aria-label="User Account"
          >
            <User size={18} strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;