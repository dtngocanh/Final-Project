import React from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Home,
  Package,
  ShoppingCart,
  List,
  Info,
  Phone,
  HelpCircle,
  User,
  LogOut,
  ChefHat,
  Carrot,
  Citrus,
  Cherry,
  Salad,
  Leaf
} from "lucide-react";
import { closeSidebar } from "../../store/slices/popupSlice";
import { logout } from "../../store/slices/authSlice";
import { toggleTomatoMode } from "../../store/slices/uiSlice";

const mainNav = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Package, label: "Products", path: "/products" },
  { icon: ShoppingCart, label: "My Cart", path: "/cart" },
  { icon: List, label: "Order", path: "/orders" },
  { icon: ChefHat, label: "Recipes", path: "/all-recipes" },
];

const secondaryNav = [
  { icon: Info, label: "Our Story", path: "/about" },
  { icon: Phone, label: "Get in Touch", path: "/contact" },
  { icon: HelpCircle, label: "FAQ", path: "/faq" },
];

// --- COMPONENT FLOATING DECOR ĐÃ ĐƯỢC TỐI ƯU CHO SIDEBAR ---
const SidebarFloatingDecor = () => {
  const decorItems = [
    { Icon: Carrot, size: 50, top: "8%", right: "8%", rotate: 25, delay: 0 },
    { Icon: Citrus, size: 65, top: "35%", left: "-5%", rotate: -20, delay: 2 },
    { Icon: Cherry, size: 45, top: "55%", right: "4%", rotate: 45, delay: 1 },
    { Icon: Salad, size: 60, bottom: "25%", left: "8%", rotate: -10, delay: 3 },
    { Icon: Leaf, size: 40, bottom: "12%", right: "10%", rotate: 30, delay: 4 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Hiệu ứng đổ bóng Blur nền xanh nhẹ tinh tế */}
      <div className="absolute top-[-10%] left-[-10%] w-[250px] h-[250px] bg-[#77cd3a]/10 dark:bg-[#77cd3a]/5 blur-[60px] rounded-full" />
      
      {decorItems.map((item, index) => (
        <motion.div
          key={index}
          // Đã bỏ 'hidden xl:block' để hiển thị đẹp mắt trên cả giao diện mobile
          className="absolute opacity-[0.07] dark:opacity-[0.04]"
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            bottom: item.bottom,
          }}
          animate={{
            y: [0, 15, 0], // Biên độ nhấp nhô nhẹ nhàng phù hợp không gian hẹp
            rotate: [item.rotate, item.rotate + 12, item.rotate],
          }}
          transition={{
            duration: 8 + index * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: item.delay,
          }}
        >
          <item.Icon size={item.size} strokeWidth={0.6} className="text-[#025c37] dark:text-[#77cd3a]" />
        </motion.div>
      ))}
    </div>
  );
};

// --- COMPONENT SIDEBAR CHÍNH ---
const Sidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  
  const { authUser } = useSelector((state) => state.auth);
  const { isSidebarOpen } = useSelector((state) => state.popup);
  const isTomatoMode = useSelector((state) => state.ui?.isTomatoMode);

  if (!isSidebarOpen) return null;

  const handleClose = () => dispatch(closeSidebar());

  const handleLogout = () => {
    dispatch(logout());
    dispatch(closeSidebar());
  };

  const renderLinks = (items) => {
    return items.map((item, index) => {
      const Icon = item.icon;
      const isActive = location.pathname === item.path;
      return (
        <Link
          key={index}
          to={item.path}
          onClick={handleClose}
          className={`group flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-medium tracking-wide transition-all duration-300 relative overflow-hidden ${
            isActive 
              ? "bg-[#025c37]/10 text-[#025c37] dark:bg-[#77cd3af2]/10 dark:text-[#77cd3af2] font-semibold shadow-[inset_1px_1px_2px_rgba(0,0,0,0.02)]" 
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          {/* BACKGROUND HOVER */}
          {!isActive && (
            <div className="absolute inset-0 bg-[#025c37]/5 dark:bg-[#77cd3af2]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          )}

          {/* ICON HOVER: Lắc nhẹ góc 5 độ và scale */}
          <div className={`p-1 rounded-lg transition-all duration-300 relative z-10 ${!isActive && "group-hover:scale-110 group-hover:rotate-[5deg] group-hover:text-[#025c37] dark:group-hover:text-[#77cd3af2]"}`}>
            <Icon size={17} strokeWidth={isActive ? 2.2 : 1.6} />
          </div>

          {/* TEXT HOVER: Chữ dịch chuyển sang phải 4px và đổi màu đậm đà */}
          <span className={`relative z-10 transition-all duration-300 transform ${
            isActive 
              ? "" 
              : "group-hover:translate-x-1 group-hover:text-[#025c37] dark:group-hover:text-[#77cd3af2] group-hover:font-semibold"
          }`}>
            {item.label}
          </span>
          
          {/* CHẤM CHỈ BÁO ACTIVE */}
          {isActive && (
            <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#025c37] dark:bg-[#77cd3af2] animate-pulse" />
          )}
        </Link>
      );
    });
  };

  return (
    <>
      {/* OVERLAY */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/50 z-[100] backdrop-blur-sm transition-all duration-500 animate-in fade-in"
        onClick={handleClose}
      />

      {/* SIDEBAR CONTAINER */}
      <aside className="fixed left-0 top-0 h-full w-[85vw] max-w-[280px] xs:max-w-[300px] sm:max-w-[320px] z-[110] bg-white dark:bg-[#050c0b] border-r border-gray-100 dark:border-white/5 flex flex-col transition-all duration-500 ease-in-out animate-in slide-in-from-left overflow-hidden">
        
        {/* CHÈN HOẠT ẢNH FLOATING DECOR VÀO ĐÂY (Nằm dưới Menu, trên nền) */}
        <SidebarFloatingDecor />

        {/* CLOSE BUTTON */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors relative z-10"
          aria-label="Close Menu"
        >
          <X size={16} strokeWidth={2} />
        </button>

        {/* 1. TOP BRANDING SECTION */}
        <div className="p-5 xs:p-6 pt-10 pb-3 flex items-center gap-2.5 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-[#025c37]/5 dark:bg-[#77cd3af2]/10 flex items-center justify-center border border-[#025c37]/10 dark:border-[#77cd3af2]/10 flex-shrink-0">
            <img src="/hahahaha.png" alt="logo" className="w-4 h-4 object-contain" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="uppercase tracking-[0.25em] text-[10px] font-black text-[#025c37] dark:text-[#77cd3af2]">Veganic</span>
              <span className="text-[9px]">🌱</span>
            </div>
            <h2 className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium">
              Explore the <span className="font-serif italic lowercase text-gray-600 dark:text-gray-300 font-semibold">freshness</span>
            </h2>
          </div>
        </div>

        {/* 2. NAVIGATION AREA */}
        <nav 
          className="flex-1 overflow-y-auto px-3 xs:px-4 py-2 space-y-5 relative z-10"
          style={{ scrollbarWidth: 'none' }}
        >
          <style>{`nav::-webkit-scrollbar { display: none; }`}</style>
          
          {/* Main Group */}
          <div className="space-y-0.5">
            <p className="px-4 pb-1.5 text-[9px] uppercase tracking-[0.15em] font-bold text-gray-400 dark:text-gray-500">Menu</p>
            {renderLinks(mainNav)}
          </div>

          {/* Line ngăn cách */}
          <div className="h-[1px] bg-gray-100 dark:bg-white/5 mx-4" />

          {/* Secondary Group */}
          <div className="space-y-0.5">
            <p className="px-4 pb-1.5 text-[9px] uppercase tracking-[0.15em] font-bold text-gray-400 dark:text-gray-500">Info</p>
            {renderLinks(secondaryNav)}
          </div>
        </nav>

        {/* 3. BOTTOM UTILITIES SECTION */}
        <div className="p-4 space-y-2.5 bg-white/90 dark:bg-[#050c0b]/90 backdrop-blur-md border-t border-gray-100 dark:border-white/5 relative z-10">
          
          {/* TOMATO MODE */}
          <button 
            onClick={() => dispatch(toggleTomatoMode())}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all duration-300 group ${
              isTomatoMode
                ? "bg-red-500/[0.05] border-red-500/20 text-red-600 dark:text-red-400"
                : "bg-gray-50/50 dark:bg-[#0b1614] border-transparent text-gray-500 hover:border-gray-200 dark:hover:border-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`text-sm transition-transform duration-500 ${isTomatoMode ? "scale-110 rotate-12" : "grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100"}`}>
                🍅
              </span>
              <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                Tomato Mode
              </span>
            </div>
            
            <div className={`w-6 h-3.5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${isTomatoMode ? "bg-red-500" : "bg-gray-200 dark:bg-gray-800"}`}>
              <div className={`w-2.5 h-2.5 bg-white rounded-full transition-all duration-200 ${isTomatoMode ? "translate-x-2.5" : "translate-x-0"}`} />
            </div>
          </button>

          {/* PROFILE CARD */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50/50 dark:bg-[#0b1614] border border-transparent">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                <User size={13} className="text-gray-600 dark:text-gray-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[90px] xs:max-w-[110px]">
                  {authUser?.name || "Guest"}
                </p>
              </div>
            </div>

            {/* Logout Trigger */}
            {authUser ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 p-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex-shrink-0"
              >
                <LogOut size={12} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Out</span>
              </button>
            ) : (
              <span className="text-[9px] tracking-widest text-[#025c37] dark:text-[#77cd3af2] font-semibold pr-1">
                PURE
              </span>
            )}
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;