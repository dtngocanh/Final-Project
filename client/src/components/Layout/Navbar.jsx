import { Menu, ShoppingCart, Sun, Moon, Search, User } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import { toggleAuthPopup, toggleCart, toggleSearchBar, toggleSidebar } from "../../store/slices/popupSlice";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();

  const { cart } = useSelector((state) => state.cart);
  const cartItemsCount = cart ? cart.reduce((total, item) => total + item.quantity, 0) : 0;

  // MÀU SẮC CHUẨN TỪ FOOTER
  const darkGreenLight = "#77cd3af2"; // Xanh lá sáng (Neon nhẹ)
  const lightGreenDark = "#025c37";   // Xanh lá đậm
  const activeColor = theme === "dark" ? darkGreenLight : lightGreenDark;

  return (
    <nav className="relative flex items-center justify-between px-6 md:px-16 lg:px-24 py-4 sticky top-0 z-[40] transition-all duration-500 bg-white dark:bg-[#061211]">
      
      {/* LỚP NỀN GRADIENT: 
        Dùng màu xanh đen đặc trưng của Footer (khoảng #061211 hoặc #08100f) 
        kết hợp với backdrop-blur để tạo độ sâu.
      */}
      <div className="absolute inset-0 bg-white/70 dark:bg-[#061211]/90 backdrop-blur-2xl z-0" />

      {/* 1. LEFT: MENU & LOGO */}
      <div className="relative z-10 flex items-center gap-4">
        <button 
          onClick={() => dispatch(toggleSidebar())} 
          className="p-2 hover:opacity-80 transition-opacity"
        >
          <Menu size={26} strokeWidth={1.5} style={{ color: activeColor }} />
        </button>

        <a href="/" className="flex items-center gap-0 group">
          <img
            src={theme === "dark" ? "/logohaha1.png" : "/logohaha.png"}
            alt="logo"
            className="w-11 h-11 object-contain transition-transform duration-500 group-hover:scale-105"
          />
          <span 
            className="font-serif italic text-2xl tracking-tighter ml-[-6px] drop-shadow-[0_0_8px_rgba(119,205,58,0.3)]" 
            style={{ color: activeColor }}
          >
            Veganic
          </span>
        </a>
      </div>

      {/* 2. RIGHT: ACTIONS */}
      <div className="relative z-10 flex items-center gap-2 md:gap-4">
        
        {/* Search */}
        <button onClick={() => dispatch(toggleSearchBar())} className="p-2.5 hover:scale-110 transition-transform">
          <Search size={20} strokeWidth={2} style={{ color: activeColor }} />
        </button>

        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="p-2.5 hover:scale-110 transition-transform">
          {theme === "dark" ? (
            <Sun size={20} strokeWidth={2} className="text-yellow-400" />
          ) : (
            <Moon size={20} strokeWidth={2} style={{ color: activeColor }} />
          )}
        </button>

        {/* Shopping Cart */}
        <button onClick={() => dispatch(toggleCart())} className="relative p-2.5 hover:scale-110 transition-transform">
          <ShoppingCart size={22} strokeWidth={2} style={{ color: activeColor }} />
          {cartItemsCount > 0 && (
            <span 
              className="absolute top-1 right-1 text-[9px] font-bold text-white w-4 h-4 flex items-center justify-center rounded-full shadow-lg"
              style={{ backgroundColor: activeColor }}
            >
              {cartItemsCount}
            </span>
          )}
        </button>

        {/* User Profile - Bo viền mờ giống phong cách Footer */}
        <button
          onClick={() => dispatch(toggleAuthPopup())}
          className="ml-2 flex items-center justify-center w-10 h-10 rounded-full border transition-all hover:bg-white/5"
          style={{ 
            borderColor: theme === "dark" ? "rgba(119, 205, 58, 0.2)" : "rgba(2, 92, 55, 0.2)",
            color: activeColor 
          }}
        >
          <User size={18} strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;