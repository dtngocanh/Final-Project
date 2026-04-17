import React, { useEffect, useMemo, useState } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ChevronRight,
  Box,
  Trash2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

import FloatingDecor from "../components/Fruit/FloatingDecor";
import { cancelOrder, fetchMyOrders } from "../store/slices/orderSlice";

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");

  const { myOrders, fetchingOrders } = useSelector((state) => state.order);
  const { authUser } = useSelector((state) => state.auth);

  const currentOrders = myOrders || [];

  useEffect(() => {
    if (authUser) {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, authUser]);

  const filterOrders = useMemo(() => {
    if (!currentOrders) return [];
    return currentOrders.filter((order) => {
      return statusFilter === "all" || order.orderStatus === statusFilter;
    });
  }, [currentOrders, statusFilter]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Processing":
        return <Package className="w-5 h-5 text-yellow-500" />;
      case "Shipped":
        return <Truck className="w-5 h-5 text-blue-500" />;
      case "Delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "Canceled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-yellow-500" />;
    }
  };

  const handleCancelOrder = (orderId) => {
    Swal.fire({
      title: '<span style="font-size: 18px; font-weight: 600; color: #4b5563;">Cancel this order?</span>',
      html: '<p style="font-size: 13px; color: #9ca3af;">It’s okay, you can always order again later.</p>',
      showCancelButton: true,
      confirmButtonText: "Yes, cancel",
      cancelButtonText: "Keep it",
      buttonsStyling: false,
      customClass: {
        popup: "shadow-2xl border border-gray-50 rounded-[30px]",
        confirmButton: "mx-2 px-4 py-2 text-[11px] font-bold uppercase tracking-tight text-red-400 bg-white border border-red-100 rounded-full hover:bg-red-50 transition-all",
        cancelButton: "mx-2 px-4 py-2 text-[11px] font-bold uppercase tracking-tight text-gray-400 bg-white border border-gray-100 rounded-full hover:bg-gray-50 transition-all",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(cancelOrder(orderId))
          .unwrap()
          .then(() => {
            Swal.fire({
              title: '<span style="text-[13px] font-medium uppercase">Success</span>',
              timer: 1500,
              showConfirmButton: false,
            });
          });
      }
    });
  };

  return (
    <main className="min-h-screen pt-24 pb-16 bg-white dark:bg-[#060606] relative overflow-hidden transition-colors duration-700">
      <FloatingDecor />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-[#77cd3a] mb-3">
              <Box size={16} className={fetchingOrders ? "animate-spin" : "animate-pulse"} />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">
                {fetchingOrders ? "Harvesting Data..." : "Order History"}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extralight tracking-tighter dark:text-white uppercase italic font-serif">
              My Orders
            </h1>
          </div>

          <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-white/[0.03] p-1.5 rounded-2xl border border-gray-100 dark:border-white/5">
            {["all", "Processing", "Shipped", "Delivered", "Canceled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  statusFilter === s
                    ? "bg-[#77cd3a] text-black shadow-lg"
                    : "text-gray-400 hover:text-[#77cd3a]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </header>

        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filterOrders.length > 0 ? (
              filterOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-gray-50/50 dark:bg-white/[0.02] backdrop-blur-md rounded-[32px] border border-gray-100 dark:border-white/[0.05] p-6 md:p-8 hover:border-[#77cd3a]/30 transition-all duration-500"
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-white dark:bg-black/40 rounded-2xl border border-white/10 shadow-sm">
                          {getStatusIcon(order.orderStatus)}
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Order ID</p>
                          <h3 className="text-sm font-bold dark:text-white uppercase tracking-tighter">#{order._id.slice(-8)}</h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-[8px] uppercase text-gray-400 mb-1">Total Amount</p>
                          <p className="text-xl font-light dark:text-white">${order.totalPrice}</p>
                        </div>

                        <div className="col-span-2 flex flex-wrap gap-3 items-end">
                          {order.orderStatus === "Processing" && (
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              className="px-4 py-2 glass-card hover:glow-on-hover animate-smooth text-[10px] uppercase font-bold text-red-500 flex items-center gap-2 border border-red-500/20 rounded-xl bg-red-500/5"
                            >
                              <Trash2 size={14} /> Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {authUser ? (
                        <Link
                          to={`/order/${order._id}`}
                          className="w-full lg:w-auto py-4 px-8 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 hover:bg-[#77cd3a] hover:text-black transition-all duration-500"
                        >
                          Details <ChevronRight size={14} />
                        </Link>
                      ) : (
                        <span className="text-[9px] text-gray-400 uppercase tracking-widest italic">Login required</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400 uppercase tracking-[0.3em] text-xs italic">No orders found.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};

export default Orders;