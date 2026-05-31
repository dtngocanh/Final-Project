import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Thêm hook điều hướng
import { axiosInstance } from "../lib/axios.js";
import { Bell, ArrowLeft, Package, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const NotificationPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate(); // Khởi tạo điều hướng
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // MÀU SẮC CHUẨN ĐỒNG BỘ THEO NAVBAR/FOOTER
  const darkGreenLight = "#77cd3af2"; // Xanh lá sáng (Neon nhẹ)
  const lightGreenDark = "#025c37";   // Xanh lá đậm
  const activeColor = theme === "dark" ? darkGreenLight : lightGreenDark;

  // Gọi API lấy danh sách thông báo khi vào trang
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

  // Hàm xử lý khi click vào thông báo để dẫn đến chi tiết đơn hàng
  const handleNotificationClick = (notif) => {
    // Nếu backend có trả về orderId trực tiếp
    if (notif.orderId) {
      navigate(`/order/${notif.orderId}`);
    } else {
      // Trường hợp dự phòng nếu chưa có orderId riêng, có thể chuyển hướng về trang danh sách đơn hàng chung
      navigate("/orders");
    }
  };

  // Hàm Helper để bóc tách Icon & Màu sắc dựa theo tiêu đề hoặc nội dung thông báo
  const getNotificationStyle = (title = "") => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("way")) {
      return {
        icon: <Package size={18} className="text-emerald-500 dark:text-[#77cd3a]" />,
        bg: "bg-emerald-500/10",
      };
    }
    if (lowerTitle.includes("delivered")) {
      return {
        icon: <CheckCircle2 size={18} className="text-amber-500" />,
        bg: "bg-amber-500/10",
      };
    }
    if (lowerTitle.includes("canceled")) {
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
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
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
                  className={`group relative p-4 rounded-xl border flex gap-4 transition-all duration-300 bg-white dark:bg-[#061211] cursor-pointer hover:-translate-y-0.5 ${
                    !notif.isRead
                      ? "border-emerald-500/30 dark:border-[#77cd3a]/20 shadow-md shadow-emerald-500/[0.02]"
                      : "border-gray-100 dark:border-white/[0.03] opacity-75 hover:opacity-100"
                  }`}
                >
                  {/* Cạnh trái nổi bật cho thông báo chưa đọc */}
                  {!notif.isRead && (
                    <div 
                      className="absolute top-0 left-0 bottom-0 w-[3px] rounded-l-xl" 
                      style={{ backgroundColor: activeColor }}
                    />
                  )}

                  {/* Icon tròn bọc trạng thái */}
                  <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${style.bg}`}>
                    {style.icon}
                  </div>

                  {/* Nội dung chữ */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-[#77cd3a] transition-colors">
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

                  {/* Mũi tên nhỏ ẩn hiện khi hover chỉ báo có thể nhấn vào */}
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