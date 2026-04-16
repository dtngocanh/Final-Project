import React, { useEffect, useMemo, useState } from "react";
import {
  Filter,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ChevronRight,
  Calendar,
  Box,
  Star,
  RefreshCw,
  Trash2,
  Loader2,
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
  // 1. Local State Management - stores the current active filter
  const [statusFilter, setStatusFilter] = useState("all");
  // 2. Redux store selection - Extract order list and loading state from orderSlice
  const { myOrders, fetchingOrders } = useSelector((state) => state.order);
  //Get auth status to ensure data is only fetched for authenticated users
  const { authUser } = useSelector((state) => state.auth);

  // Fallback to empty array to empty crashes
  const currentOrders = myOrders || [];
  // Automatically trigger the fetchMyOrders when component mounts or users log in
  useEffect(() => {
    if (authUser) {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, authUser]);

  // Re-caculated the displayed list only when currentOrders or statusFilter changes
  const filterOrders = useMemo(() => {
    if (!currentOrders) return [];

    return currentOrders.filter((order) => {
      // Return all if 'all' is selected, otherwise match against orderStatus
      return statusFilter === "all" || order.orderStatus === statusFilter;
    });
  }, [currentOrders, statusFilter]);

  // Logic Icon chuẩn màu sắc từ ảnh
  //Return specific Lucide icons and colors based on the current order status
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
    console.log(orderId);

    Swal.fire({
      title: "Cancel Order?",
      text: "This action cannot be undone. Are you sure you want to cancel?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel it",
      cancelButtonText: "Keep Order",
      reverseButtons: true,
      background: "#fff",
      color: "#1f2937",
      customClass: {
        popup: "rounded-3xl shadow-xl border border-gray-100",
        title: "text-xl font-bold text-gray-800",
        htmlContainer: "text-sm text-gray-500",
        confirmButton:
          "px-6 py-2.5 mx-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all duration-200 shadow-md",
        cancelButton:
          "px-6 py-2.5 mx-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200",
      },
      buttonsStyling: false,
      showClass: {
        popup: "animate__animated animate__fadeInUp animate__faster",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutDown animate__faster",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(cancelOrder(orderId))
          .unwrap()
          .then(() => {
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Your order has been canceled.",
              timer: 2000,
              showConfirmButton: false,
              background: "#fff",
              color: "#1f2937",
              customClass: {
                popup: "rounded-2xl shadow-lg border border-gray-100",
                title: "text-lg font-bold text-green-600",
              },
            });
          })
          .catch((error) => {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: error || "Something went wrong!",
              timer: 2500,
              showConfirmButton: false,
              background: "#fff",
              customClass: {
                popup: "rounded-2xl shadow-lg border border-gray-100",
              },
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
              <Box
                size={16}
                className={fetchingOrders ? "animate-spin" : "animate-pulse"}
              />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">
                {fetchingOrders ? "Harvesting Data..." : "Order History"}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extralight tracking-tighter dark:text-white uppercase italic font-serif">
              My Orders
            </h1>
          </div>

          {/* Filter Navigation */}
          <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-white/[0.03] p-1.5 rounded-2xl border border-gray-100 dark:border-white/5">
            {["all", "Processing", "Shipped", "Delivered", "Canceled"].map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    statusFilter === s
                      ? "bg-[#77cd3a] text-black shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ),
            )}
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
                          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                            Order ID
                          </p>
                          <h3 className="text-sm font-bold dark:text-white uppercase tracking-tighter">
                            #{order._id.slice(-8)}
                          </h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-[8px] uppercase text-gray-400 mb-1">
                            Total Amount
                          </p>
                          <p className="text-xl font-light dark:text-white">
                            ${order.totalPrice}
                          </p>
                        </div>

                        {/* Logic render nút dựa trên status từ ảnh d221c3 */}
                        <div className="col-span-2 flex flex-wrap gap-3 items-end">
                          {order.orderStatus === "Delivered" && (
                            <>
                              <button
                                onClick={() =>
                                  navigate(
                                    `/product/${order.orderItems[0].product}`,
                                  )
                                }
                                className="px-4 py-2 glass-card hover:glow-on-hover animate-smooth text-[10px] uppercase font-bold flex items-center gap-2 dark:text-white border border-white/10 rounded-xl bg-white/5"
                              >
                                <Star size={14} className="text-yellow-500" />{" "}
                                Write Review
                              </button>
                              <button className="px-4 py-2 glass-card hover:glow-on-hover animate-smooth text-[10px] uppercase font-bold flex items-center gap-2 dark:text-white border border-white/10 rounded-xl bg-white/5">
                                <RefreshCw size={14} /> Reorder
                              </button>
                            </>
                          )}

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
                          View Details <ChevronRight size={14} />
                        </Link>
                      ) : (
                        <span className="text-[9px] text-gray-400 uppercase tracking-widest italic">
                          Login to see full info
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400 uppercase tracking-[0.3em] text-xs italic">
                  No orders found in this category.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};

export default Orders;
