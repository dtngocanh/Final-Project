import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios.js";
import { Bell, ArrowLeft, Package, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const NotificationPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const darkGreenLight = "#77cd3af2";
  const lightGreenDark = "#025c37";   
  const activeColor = theme === "dark" ? darkGreenLight : lightGreenDark;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/user/noti");
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = (notif) => {
    if (notif.orderId) {
      navigate(`/order/${notif.orderId}`);
    } else {
      navigate("/orders");
    }
  };

  const getNotificationStyle = (title = "") => {
    const safeTitle = (title || "").toLowerCase();
    
    if (safeTitle.includes("way")) {
      return {
        icon: <Package size={18} className="text-emerald-500 dark:text-[#77cd3a]" />,
        bg: "bg-emerald-500/10",
      };
    }
    if (safeTitle.includes("delivered")) {
      return {
        icon: <CheckCircle2 size={18} className="text-amber-500" />,
        bg: "bg-amber-500/10",
      };
    }
    if (safeTitle.includes("canceled")) {
      return {
        icon: <XCircle size={18} className="text-rose-500" />,
        bg: "bg-rose-500/10",
      };
    }
    return {
      icon: <Bell size={18} style={{ color: activeColor }} />,
      bg: "bg-gray-500/10",
    };
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#030908] text-gray-800 dark:text-gray-200 transition-colors duration-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* BACK BUTTON & TITLE */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate("/")}
            className="p-2.5 bg-white dark:bg-[#061211] hover:scale-105 rounded-full shadow-sm border border-gray-100 dark:border-white/5 transition-all"
          >
            <ArrowLeft size={18} style={{ color: activeColor }} />
          </button>
          <div>
            <h1 className="text-xl tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Notifications
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Track your organic order journey status
            </p>
          </div>
        </div>

        {/* NOTIFICATIONS CONTAINER */}
        <div className="space-y-3 min-h-[350px]">
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div
                className="animate-spin rounded-full h-7 w-7 border-b-2"
                style={{ borderColor: activeColor }}
              />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400 dark:text-gray-600 gap-3">
              <div className="p-4 bg-gray-100 dark:bg-[#061211] rounded-full">
                <Bell size={28} strokeWidth={1.5} />
              </div>
              <p className="text-xs font-medium tracking-wide">All caught up! No notifications here.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const style = getNotificationStyle(notif.title);
              return (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className="group relative p-4 rounded-xl border flex gap-4 transition-all duration-300 bg-white dark:bg-[#061211] cursor-pointer hover:-translate-y-0.5 border-gray-100 dark:border-white/[0.03] shadow-sm hover:shadow-md"
                >
                  {/* Icon tròn bọc trạng thái */}
                  <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${style.bg}`}>
                    {style.icon}
                  </div>

                  {/* Nội dung chữ */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-[#77cd3a] transition-colors">
                        {notif.title}
                      </h3>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        • {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pr-6 truncate">
                      {notif.message}
                    </p>
                  </div>

                  {/* Mũi tên nhỏ khi hover */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;