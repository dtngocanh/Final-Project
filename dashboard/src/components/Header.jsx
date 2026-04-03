import React from "react";
import { useDispatch, useSelector } from "react-redux";
import avatar from "../assets/avatar.jpg"; 
import { Menu, Bell, Search } from "lucide-react";
import { toggleNavbar } from "../store/slices/extraSlice";

const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const { openedComponent } = useSelector((state) => state.extra);
  const dispatch = useDispatch();

  // Màu thương hiệu từ Login Modal của bạn
  const activeColor = "#77cd3af2";

  return (
    <header className="flex items-center justify-between py-5 px-8 mb-8 sticky top-0 z-[100] font-['Fredoka'] bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 transition-all">
      
      {/* LEFT: BREADCRUMBS & LOGO MINIMAL */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-[1.2rem] border border-gray-100 dark:border-white/10 shadow-sm">
          <img src="/hahahaha.png" alt="logo" className="w-4 h-4 object-contain opacity-80" />
          
          <span className="text-[13px] font-bold text-gray-900 dark:text-white tracking-tight">
            {user?.name || "Veganic Seller"}
          </span>

          {openedComponent && (
            <>
              <div className="w-[1px] h-3 bg-gray-300 dark:bg-white/20 mx-1"></div>
              <span className="text-[13px] font-serif italic text-[#77cd3af2] capitalize tracking-wide">
                {openedComponent}
              </span>
            </>
          )}
        </div>
      </div>

      {/* RIGHT: ACTIONS & PROFILE */}
      <div className="flex items-center gap-3 md:gap-5">
        
        {/* Search & Bell - Style tối giản */}
        <div className="hidden md:flex items-center gap-2">
           <button className="p-2.5 text-gray-400 hover:text-[#77cd3af2] hover:bg-[#77cd3af2]/5 rounded-xl transition-all">
            <Search size={19} strokeWidth={2} />
          </button>
          <button className="p-2.5 text-gray-400 hover:text-[#77cd3af2] hover:bg-[#77cd3af2]/5 rounded-xl transition-all relative">
            <Bell size={19} strokeWidth={2} />
            <span className="absolute top-2 right-2.5 size-2 bg-[#77cd3af2] border-2 border-white dark:border-[#0f172a] rounded-full"></span>
          </button>
        </div>

        {/* Menu Mobile */}
        <button 
          onClick={() => dispatch(toggleNavbar())}
          className="block md:hidden p-2 text-gray-600 dark:text-gray-300 active:scale-90 transition-transform"
        >
          <Menu size={24} />
        </button>

        {/* PROFILE AVATAR - Style Modal Path */}
        <div className="relative group cursor-pointer pl-2 border-l border-gray-100 dark:border-white/10 ml-2">
          <div className="p-[2px] rounded-2xl bg-gradient-to-tr from-[#77cd3af2] to-[#025c37] group-hover:shadow-[0_0_15px_rgba(119,205,58,0.4)] transition-all duration-500">
            <div className="size-9 rounded-[14px] overflow-hidden bg-white dark:bg-[#0f172a] border-[2px] border-white dark:border-[#0f172a]">
              <img
                src={user?.avatar?.url || avatar}
                alt="profile"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>
          
          {/* Online Glow */}
          <span className="absolute -bottom-0.5 -right-0.5 size-3.5 bg-[#77cd3af2] border-[3px] border-white dark:border-[#0f172a] rounded-full shadow-lg"></span>
        </div>

      </div>
    </header>
  );
};

export default Header;