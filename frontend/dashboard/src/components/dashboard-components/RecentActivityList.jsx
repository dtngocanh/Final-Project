import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ShoppingBasket, CheckCircle, XCircle, Clock, Eye } from "lucide-react";

const RecentActivityList = ({ orders }) => {
  const activities = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    return [...orders]
      .reverse()
      .slice(0, 4)
      .map((order) => {
        let icon = <ShoppingBasket size={16} />;
        let bg = "bg-orange-50 text-orange-500";
        let actionText = "New order placed";

        if (order.orderStatus === "Delivered") {
          icon = <CheckCircle size={16} />;
          bg = "bg-emerald-50 text-emerald-500";
          actionText = "Order delivered successfully";
        } else if (order.orderStatus === "Canceled") {
          icon = <XCircle size={16} />;
          bg = "bg-rose-50 text-rose-500";
          actionText = "Order was canceled";
        } else if (order.orderStatus === "Shipped") {
          icon = <Clock size={16} />;
          bg = "bg-blue-50 text-blue-500";
          actionText = "Order has been dispatched";
        }

        return {
          icon,
          bg,
          title: actionText,
          desc: `By ${order.shippingInfo?.fullName || "Customer"} - Total $${order.totalPrice}`,
          time:
            new Date(order.updatedAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }) +
              " - " +
              new Date(order.updatedAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }) || "Just now",
        };
      });
  }, [orders]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Live Activity</h3>
          <p className="text-xs text-gray-400">
            Realtime events from your store
          </p>
        </div>
        <Eye size={16} className="text-gray-300 animate-pulse" />
      </div>
      <div className="space-y-5">
        {activities.length > 0 ? (
          activities.map((act, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div
                className={`w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center text-sm ${act.bg}`}
              >
                {act.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-xs truncate">
                  {act.title}
                </p>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">
                  {act.desc}
                </p>
              </div>
              <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md flex-shrink-0">
                {act.time}
              </span>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-gray-400 italic text-xs">
            No recent updates
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecentActivityList;
