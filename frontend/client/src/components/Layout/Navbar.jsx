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
  // const cartItemsCount = cart
  //   ? cart.reduce((total, item) => total + (item.quantity || 1), 0)
  //   : 0;
  const cartItemsCount = cart ? cart.length : 0;

  // MÀU SẮC CHUẨN TỪ FOOTER
  const darkGreenLight = "#77cd3af2"; // Xanh lá sáng (Neon nhẹ)
  const lightGreenDark = "#025c37"; // Xanh lá đậm
  const activeColor = theme === "dark" ? darkGreenLight : lightGreenDark;

  return (
    <nav className="sticky top-0 z-50 w-full transition-all duration-500 bg-white/80 dark:bg-[#061211]/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* 1. LEFT: MENU & LOGO */}
        <div className="flex items-center gap-1 sm:gap-3">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-1.5 sm:p-2 -ml-1 sm:ml-0 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle Menu"
          >
            <Menu
              size={22}
              sm:size={24}
              strokeWidth={1.5}
              style={{ color: activeColor }}
            />
          </button>

          <a href="/" className="flex items-center gap-0.5 sm:gap-1 group">
            <img
              src={theme === "dark" ? "/logohaha1.png" : "/logohaha.png"}
              alt="logo"
              className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 object-contain transition-transform duration-500 group-hover:scale-105"
            />
            {/* Ẩn chữ thương hiệu trên thiết bị siêu nhỏ < 360px để không bị đẩy icon, hoặc thu nhỏ size chữ trên mobile */}
            <span
              className="hidden min-[360px]:inline-block font-serif italic text-lg sm:text-2xl tracking-tighter drop-shadow-[0_0_8px_rgba(119,205,58,0.3)] select-none ml-[-2px] sm:ml-[-6px]"
              style={{ color: activeColor }}
            >
              Veggies
            </span>
          </a>
        </div>

        {/* 2. RIGHT: ACTIONS (Hiển thị đầy đủ tính năng trên cả Mobile) */}
        <div className="flex items-center gap-0.5 sm:gap-1.5">
          {/* Search */}
          <button
            onClick={() => dispatch(toggleSearchBar())}
            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all hover:scale-105"
            aria-label="Search"
          >
            <Search
              className="w-[19px] h-[19px] sm:w-[20px] sm:h-[20px]"
              strokeWidth={2}
              style={{ color: activeColor }}
            />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all hover:scale-105"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun
                className="w-[19px] h-[19px] sm:w-[20px] sm:h-[20px] text-yellow-400"
                strokeWidth={2}
              />
            ) : (
              <Moon
                className="w-[19px] h-[19px] sm:w-[20px] sm:h-[20px]"
                strokeWidth={2}
                style={{ color: activeColor }}
              />
            )}
          </button>

          {/* Bell Notifications */}
          <button
            onClick={() => navigate("/notifications")}
            className="relative p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all hover:scale-105"
            aria-label="Notifications"
          >
            <Bell
              className="w-[19px] h-[19px] sm:w-[20px] sm:h-[20px]"
              strokeWidth={2}
              style={{ color: activeColor }}
            />
          </button>

          {/* Shopping Cart */}
          <button
            onClick={() => dispatch(toggleCart())}
            className="relative p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all hover:scale-105 group"
            aria-label="Cart"
          >
            <ShoppingBag
              strokeWidth={2}
              style={{ color: activeColor }}
              className="w-[19px] h-[19px] sm:w-[21px] sm:h-[21px] transition-transform group-hover:scale-110"
            />
            {cartItemsCount > 0 && (
              <span
                className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 text-[8px] sm:text-[10px] font-bold text-white min-w-[14px] sm:min-w-[16px] h-3.5 sm:h-4 px-1 flex items-center justify-center rounded-full shadow-md select-none pointer-events-none"
                style={{ backgroundColor: activeColor }}
              >
                {cartItemsCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          <button
            onClick={() => dispatch(toggleAuthPopup())}
            className="flex p-1.5 sm:p-2 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-white/5"
            style={{ color: activeColor }}
            aria-label="User Account"
          >
            <User
              className="w-[19px] h-[19px] sm:w-[20px] sm:h-[20px]"
              strokeWidth={2}
            />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
