import React from "react";
import {
  LayoutDashboard,
  ListOrdered,
  Package,
  Users,
  User,
  LogOut,
  X,
  Tags,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom"; // QUAN TRỌNG: Dùng NavLink
import { toggleNavbar } from "../store/slices/extraSlice";
import { logout } from "../store/slices/authSlice";

const SideBar = () => {
  const dispatch = useDispatch();
  const { isNavbarOpened } = useSelector((state) => state.extra);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Định nghĩa route tương ứng với từng item
  const menuItems = [
    { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/users", icon: <Users size={20} />, label: "Users" },
    { to: "/orders", icon: <ListOrdered size={20} />, label: "Orders" },
    { to: "/products", icon: <Package size={20} />, label: "Products" },
    { to: "/categories", icon: <Tags size={20} />, label: "Categories" },
    // { to: "/profile", icon: <User size={20} />, label: "Profile" },
  ];

  // Hàm xử lý khi click trên Mobile
  const handleNavClick = () => {
    if (window.innerWidth < 1024) dispatch(toggleNavbar());
  };

  return (
    <>
      {/* OVERLAY */}
      {isNavbarOpened && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[105] lg:hidden animate-in fade-in duration-300"
          onClick={() => dispatch(toggleNavbar())}
        />
      )}

      {/* ASIDE */}
      <aside
        className={`
        fixed lg:sticky top-0 left-0 z-[110]
        w-72 h-screen 
        bg-white dark:bg-[#050505] 
        border-r border-gray-100 dark:border-white/5 
        flex flex-col 
        transition-all duration-500 ease-in-out font-['Fredoka']
        ${isNavbarOpened ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <button
          onClick={() => dispatch(toggleNavbar())}
          className="lg:hidden absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-10 pb-8 flex flex-col items-start gap-4">
          <div className="flex items-center gap-2 text-[#025c37] dark:text-[#77cd3af2] opacity-80">
            <img
              src="/hahahaha.png"
              alt="logo"
              className="w-6 h-6 object-contain"
            />
            <span className="uppercase tracking-[0.4em] text-[10px] font-black italic">
              Veggies
            </span>
          </div>
          <h2 className="text-3xl font-light text-gray-900 dark:text-white">
            Veggies
            <span className="font-serif italic text-[#77cd3af2]"> Admin</span>
          </h2>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 mb-4 flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-gray-300 dark:text-gray-600 font-black">
            <Package size={10} />
            Main Menu
          </p>

          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              // NavLink cung cấp tham số isActive dựa trên URL hiện tại
              className={({ isActive }) => `
  w-full flex items-center justify-between p-4 rounded-2xl
  transition-all duration-300 group border

  ${
    isActive
      ? `
        bg-gradient-to-r
        from-[#77cd3af2]/15
        to-transparent
        text-[#77cd3af2]
        border-[#77cd3af2]/10
        shadow-sm shadow-[#77cd3af2]/10
      `
      : `
        border-transparent
        text-gray-400 dark:text-gray-500
        hover:bg-[#77cd3af2]/5
        hover:text-[#77cd3af2]
        hover:translate-x-1
      `
  }
`}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-4">
                    <span
                      className={`
    transition-all duration-300
    ${
      isActive
        ? "scale-110 text-[#77cd3af2]"
        : "group-hover:scale-105 group-hover:text-[#77cd3af2]"
    }
  `}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`text-sm tracking-wide ${isActive ? "font-bold" : "font-medium"}`}
                    >
                      {item.label}
                    </span>
                  </div>
                  {isActive && (
                    <div className="size-1.5 rounded-full bg-[#77cd3af2] shadow-[0_0_10px_#77cd3af2]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
          <div
            onClick={() => navigate("/profile")}
            className="
    group cursor-pointer
    flex items-center gap-3 mb-6 px-3 py-3
    rounded-2xl
    bg-white dark:bg-black/20
    border border-gray-100 dark:border-white/5

    transition-all duration-300

    hover:bg-[#77cd3af2]/5
    hover:border-[#77cd3af2]/20
    hover:shadow-lg
    hover:shadow-[#77cd3af2]/10
    hover:-translate-y-0.5
  "
          >
            <img
              src={user?.avatar?.url || "/tmt.jpg"}
              className="
      size-11 rounded-full object-cover
      border border-[#77cd3af2]/20

      transition-all duration-300

      group-hover:scale-110
      group-hover:border-[#77cd3af2]/50
    "
              alt="Admin"
            />

            <div className="overflow-hidden">
              <p
                className="
        text-[11px]
        truncate
        font-bold
        text-gray-900
        dark:text-white

        transition-colors duration-300

        group-hover:text-[#77cd3af2]
      "
              >
                {user?.name || "Admin"}
              </p>

              <p className="text-[8px] text-[#77cd3af2] uppercase tracking-widest font-black">
                Admin Portal
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              try {
                await dispatch(logout()).unwrap();
                window.location.href = "/login";
              } catch (error) {
                console.log(error);
              }
            }}
            className="
    w-full flex items-center gap-3 p-4 rounded-2xl

    text-red-500/70

    hover:text-red-600
    hover:bg-red-50
    dark:hover:bg-red-500/5

    transition-all duration-300

    hover:-translate-y-0.5

    group
  "
          >
            <LogOut
              size={18}
              className="
      transition-all duration-300
      group-hover:-translate-x-1
      group-hover:rotate-12
    "
            />

            <span className="text-[10px] uppercase tracking-[0.2em] font-black">
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
