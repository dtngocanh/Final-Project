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
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { closeSidebar } from "../../store/slices/popupSlice";
import { logout } from "../../store/slices/authSlice";
// 1. Import action toggle từ slice của bạn (giả sử tên là uiSlice)
import { toggleTomatoMode } from "../../store/slices/uiSlice";

const menuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Package, label: "Products", path: "/products" },
  { icon: ShoppingCart, label: "My Cart", path: "/cart" },
  { icon: List, label: "Order", path: "/orders" },
  { icon: Info, label: "Our Story", path: "/about" },
  { icon: Phone, label: "Get in Touch", path: "/contact" },
  { icon: HelpCircle, label: "FAQ", path: "/faq" },
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { isSidebarOpen } = useSelector((state) => state.popup);
  
  // 2. Lấy trạng thái từ Redux
  const isTomatoMode = useSelector((state) => state.ui?.isTomatoMode);

  if (!isSidebarOpen) return null;

  const handleClose = () => dispatch(closeSidebar());

  const handleLogout = () => {
    dispatch(logout());
    dispatch(closeSidebar());
  };

  return (
    <>
      {/* OVERLAY: Mờ ảo diệu hơn */}
      <div
        className="fixed inset-0 bg-white/40 dark:bg-gray-950/60 z-[100] transition-all duration-500 animate-in fade-in"
        onClick={handleClose}
      />

      {/* SIDEBAR: Trượt nhẹ nhàng */}
      <aside className="fixed left-0 top-0 h-full w-full max-w-[320px] md:max-w-[400px] z-[110] bg-white/90 dark:bg-gray-950/95 backdrop-blur-2xl shadow-[50px_0_100px_-20px_rgba(0,0,0,0.1)] flex flex-col transition-all duration-500 ease-in-out animate-in slide-in-from-left">
        
        {/* CLOSE BUTTON: Lơ lửng tối giản */}
        <button
          onClick={handleClose}
          className="absolute top-8 right-8 p-2 text-gray-400 hover:text-red-500 transition-all duration-300 hover:rotate-90"
        >
          <X size={28} strokeWidth={1} />
        </button>

        {/* TOP BRANDING */}
        <div className="p-12 pb-8 flex flex-col items-start gap-4">
          <div className="flex items-center gap-2 text-[#025c37] dark:text-[#77cd3af2] opacity-70">
            <img src="/hahahaha.png" alt="" className="w-6 h-6 object-contain" />
            <span className="uppercase tracking-[0.4em] text-[10px] font-bold">Veganic</span>
          </div>
          <h2 className="text-3xl font-light text-gray-900 dark:text-white leading-tight">
            Explore the <br />
            <span className="font-serif italic border-b border-[#77cd3af2]/30">Freshness</span>
          </h2>
        </div>

        {/* NAVIGATION: Kiểu "Underline Flow" */}
        <nav className="flex-1 overflow-y-auto px-12 py-6 space-y-8">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                to={item.path}
                onClick={handleClose}
                className="group flex items-center gap-6 text-gray-400 hover:text-black dark:hover:text-white transition-all duration-300"
              >
                <Icon size={20} strokeWidth={1.5} className="group-hover:text-[#77cd3af2] group-hover:scale-110 transition-all" />
                <div className="relative">
                  <span className="text-lg text-gray-600 tracking-wide group-hover:not-italic group-hover:font-sans transition-all">{item.label}</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#77cd3af2] transition-all duration-300 group-hover:w-full" />
                </div>
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM: Profile & Tomato Toggle */}
        <div className="p-12 pt-8 border-t border-gray-100 dark:border-gray-900">
          
          {/* NÚT BẬT CÀ CHUA (TOMATO MODE) */}
          <button 
            onClick={() => dispatch(toggleTomatoMode())}
            className="w-full flex items-center justify-between p-4 mb-8 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 transition-all duration-500 group"
          >
            <div className="flex items-center gap-3">
              <span className={`text-xl transition-all duration-700 ${isTomatoMode ? "rotate-[360deg] scale-125" : "grayscale opacity-50"}`}>
                🍅
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 group-hover:text-red-500 transition-colors">
                Tomato Mode
              </span>
            </div>
            {/* Custom Switch */}
            <div className={`w-8 h-4 rounded-full p-1 transition-colors duration-300 ${isTomatoMode ? "bg-red-500" : "bg-gray-300"}`}>
              <div className={`w-2 h-2 bg-white rounded-full transition-all duration-300 ${isTomatoMode ? "translate-x-4" : "translate-x-0"}`} />
            </div>
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center border border-gray-100 dark:border-gray-800">
              <User size={20} className="text-[#77cd3af2]" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Member</p>
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {authUser?.name|| "Guest Voyager"}
              </p>
            </div>
          </div>

          {authUser ? (
            <button
              onClick={handleLogout}
              className="group flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-bold text-red-400 hover:text-red-600 transition-all"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          ) : (
            <div className="opacity-40 italic text-[11px] tracking-wider dark:text-gray-500">
              Living life on the green side.
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;