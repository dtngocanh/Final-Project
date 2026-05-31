import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight} from "lucide-react";
import { Link } from 'react-router-dom';
const RecentOrdersTable = ({ orders }) => {
  const statusColors = {
    Delivered: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    Processing: "bg-purple-50 text-purple-600 border border-purple-100",
    Shipped: "bg-blue-50 text-blue-600 border border-blue-100",
    Pending: "bg-amber-50 text-amber-600 border border-amber-100",
    Canceled: "bg-rose-50 text-rose-600 border border-rose-100",
  };

  const recentOrders = useMemo(() => {
    return orders ? [...orders].reverse().slice(0, 5) : [];
  }, [orders]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            Recent Transactions
          </h3>
          <p className="text-xs text-gray-400">
            Latest activity from Veganic shop
          </p>
        </div>
        <Link
          to="/orders"
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
        >
          View all <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="text-gray-400 text-[11px] font-black uppercase tracking-wider border-b border-gray-50">
              <th className="pb-3">Customer</th>
              <th className="pb-3">Order ID</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/50">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 font-bold text-xs bg-gray-100 group-hover:bg-[#77cd3af2] group-hover:text-white transition-all text-gray-700 flex items-center justify-center rounded-full">
                        {order.shippingInfo?.fullName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase() || "VU"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-xs">
                          {order.shippingInfo?.fullName || "Anonymous"}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {order.user ? "Registered" : "Guest"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-xs text-gray-500 font-medium">
                    #{order._id?.slice(-6).toUpperCase()}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-xl ${statusColors[order.orderStatus] || "bg-gray-50 text-gray-600"}`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-3.5 text-right font-bold text-gray-900 text-xs">
                    ${order.totalPrice?.toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="py-6 text-center text-gray-400 italic text-xs"
                >
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default RecentOrdersTable;
