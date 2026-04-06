import React from 'react';
import {
  LayoutDashboard, ListOrdered, Package,
  Users, User, LogOut, ShieldCheck, X
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleComponent, toggleNavbar } from "../store/slices/extraSlice";
import { logout } from "../store/slices/authSlice";

const SideBar = () => {
  const dispatch = useDispatch();
  // CHỖ NÀY: Đổi 'navbar' thành 'isNavbarOpened' cho đúng với Slice của ní
  const { openedComponent, isNavbarOpened } = useSelector((state) => state.extra);
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    { id: "Dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { id: "Orders", icon: <ListOrdered size={20} />, label: "Orders" },
    { id: "Products", icon: <Package size={20} />, label: "Products" },
    { id: "Users", icon: <Users size={20} />, label: "Users" },
    { id: "Profile", icon: <User size={20} />, label: "Profile" },
  ];

  const handleNavClick = (id) => {
    dispatch(toggleComponent(id));
    if (window.innerWidth < 1024) dispatch(toggleNavbar());
  };

  return (
    <>
      {/* OVERLAY: Sử dụng isNavbarOpened */}
      {isNavbarOpened && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[105] lg:hidden animate-in fade-in duration-300"
          onClick={() => dispatch(toggleNavbar())}
        />
      )}

      {/* ASIDE: Sử dụng isNavbarOpened để trượt */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-[110]
        w-72 h-screen 
        bg-white dark:bg-[#050505] 
        border-r border-gray-100 dark:border-white/5 
        flex flex-col 
        transition-all duration-500 ease-in-out font-['Fredoka']
        ${isNavbarOpened ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>

        <button
          onClick={() => dispatch(toggleNavbar())}
          className="lg:hidden absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-10 pb-8 flex flex-col items-start gap-4">
          <div className="flex items-center gap-2 text-[#025c37] dark:text-[#77cd3af2] opacity-80">
            <img src="/hahahaha.png" alt="logo" className="w-6 h-6 object-contain" />
            <span className="uppercase tracking-[0.4em] text-[10px] font-black italic">Veganic</span>
          </div>
          <h2 className="text-3xl font-light text-gray-900 dark:text-white leading-tight">
            Seller <br />
            <span className="font-serif italic border-b-2 border-[#77cd3af2]/30">Portal</span>
          </h2>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 mb-4 text-[9px] uppercase tracking-[0.3em] text-gray-300 dark:text-gray-600 font-black">Main Menu</p>

          {menuItems.map((item) => {
            const isActive = openedComponent === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${isActive
                    ? "bg-[#77cd3af2]/10 text-[#77cd3af2]"
                    : "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/[0.02] hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`transition-all duration-300 ${isActive ? "scale-110" : "group-hover:text-[#77cd3af2]"}`}>
                    {item.icon}
                  </span>
                  <span className={`text-sm tracking-wide ${isActive ? "font-bold" : "font-medium"}`}>
                    {item.label}
                  </span>
                </div>
                {isActive && <div className="size-1.5 rounded-full bg-[#77cd3af2] shadow-[0_0_10px_#77cd3af2]" />}
              </button>
            );
          })}
        </nav>

        <div className="p-6 mt-auto border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
          <div className="flex items-center gap-3 mb-6 px-2 p-3 rounded-2xl bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5">
            <img
              src={user?.avatar?.url || "/tmt.jpg"}
              className="size-10 rounded-full object-cover border border-[#77cd3af2]/20"
              alt="Admin"
            />
            <div className="overflow-hidden">
              <p className="text-[11px] text-gray-900 dark:text-white truncate font-bold">{user?.name || "Admin"}</p>
              <p className="text-[8px] text-[#77cd3af2] uppercase tracking-widest font-black">Admin Portal</p>
            </div>
          </div>

          <button
            onClick={() => { dispatch(logout()); window.location.href = "/login"; }}
            className="w-full flex items-center gap-3 p-4 rounded-xl text-red-500/70 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-black">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideBar;