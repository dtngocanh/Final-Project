import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom"; 
import { Menu, Bell, Search } from "lucide-react";
import { toggleNavbar } from "../store/slices/extraSlice"; 

const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  // 1. Lấy location hiện tại từ URL
  const location = useLocation();
  const navigate = useNavigate();

  // 2. Hàm định dạng path sang tên hiển thị (VD: "/orders" -> "Orders")
  const getBreadcrumb = () => {
    const path = location.pathname.split("/")[1]; 
    if (!path) return "Dashboard"; 
    return path; 
  };

  return (
    <header className="flex justify-between items-center mb-3 pb-2 pt-5 px-4 md:px-8 sticky top-0 z-[100] bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl transition-all font-['Fredoka']">
      
      {/* LEFT SIDE: Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Nút Hamburger */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            dispatch(toggleNavbar());
          }}
          className="lg:hidden p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all relative z-[120]"
        >
          <Menu size={24} />
        </button>

        <p className="flex items-center gap-2 text-xs md:text-sm">
          <span className="text-gray-400 font-medium hidden sm:inline">
            {user?.name || "Veganic Seller"}
          </span>
          <span className="text-gray-300 hidden sm:inline">/</span>
          {/* 3. Hiển thị động theo URL thực tế */}
          <span className="text-gray-900 dark:text-white font-bold capitalize tracking-wide">
            {getBreadcrumb()}
          </span>
        </p>
      </div>

      {/* RIGHT SIDE: Actions & Profile */}
      <div className="flex gap-2 md:gap-4 items-center">
        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-400 hover:text-[#77cd3af2] transition-colors">
            <Search size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-[#77cd3af2] transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 size-1.5 bg-[#77cd3af2] rounded-full shadow-[0_0_8px_#77cd3af2]"></span>
          </button>
        </div>

        {/* Profile Avatar */}
        <div 
          // 4. Thay vì click đổi state Redux, ta điều hướng link sang "/profile" luôn
          onClick={() => navigate("/profile")}
          className="relative cursor-pointer group ml-1"
        >
          <div className="p-0.5 rounded-full border-2 border-transparent group-hover:border-[#77cd3af2]/40 transition-all">
            <img
              src={user?.avatar?.url || "/tmt.jpg"}
              alt="avatar"
              className="size-9 md:size-11 rounded-full object-cover shadow-sm group-hover:scale-95 transition-transform duration-300"
            />
          </div>
          <span className="absolute bottom-0 right-0 size-2.5 bg-[#77cd3af2] border-2 border-white dark:border-[#050505] rounded-full"></span>
        </div>
      </div>
    </header>
  );
};

export default Header;