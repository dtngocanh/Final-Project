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
  ChevronDown,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import FloatingDecor from "../components/Fruit/FloatingDecor";
import { cancelOrder, fetchMyOrders } from "../store/slices/orderSlice";
const MontionLink = motion.create(Link);

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");

  const { myOrders, fetchingOrders } = useSelector((state) => state.order);
  const { authUser } = useSelector((state) => state.auth);

  const currentOrders = myOrders || [];

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [statusFilter]);

  useEffect(() => {
    if (authUser) {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, authUser]);

  const filterOrders = useMemo(() => {
    if (!currentOrders) return [];

    // Thêm logic sort: Đơn hàng mới nhất (createdAt) sẽ nằm lên đầu
    const sorted = [...currentOrders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    return sorted.filter((order) => {
      return statusFilter === "all" || order.orderStatus === statusFilter;
    });
  }, [currentOrders, statusFilter]);

  const getOrderThumbnail = (order) => {
    const firstItemImage = order.orderItems?.[0]?.image;

    return <OrderImage src={firstItemImage} />;
  };

  const handleCancelOrder = (orderId) => {
    dispatch(cancelOrder(orderId))
      .unwrap()
      .then(() => {
        setStatusFilter("Canceled");
      })
      .catch((err) => console.error("Cancel failed:", err));
  };

  return (
    <main className="min-h-screen pt-24 pb-16 bg-white dark:bg-[#060606] relative overflow transition-colors duration-700">
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
            <h1 className="text-3xl md:text-5xl tracking-tighter dark:text-white uppercase">
              My Orders
            </h1>
          </div>

          <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-white/[0.03] p-1.5 rounded-2xl border border-gray-100 dark:border-white/5">
            {["all", "Processing", "Shipped", "Delivered", "Canceled"].map(
              (s) => (
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
                      <div className="flex items-center gap-5 mb-6">
                        {/* Khung ảnh sản phẩm đại diện */}
                        <div className="relative group">
                          <div className="p-1 bg-white dark:bg-black/40 rounded-2xl border border-white/10 shadow-sm overflow-hidden w-16 h-16 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                            {getOrderThumbnail(order)}
                          </div>
                          {/* Hiển thị số lượng sản phẩm khác */}
                          {order.orderItems.length > 1 && (
                            <div className="absolute -top-2 -right-2 bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-[#060606]">
                              +{order.orderItems.length - 1}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <div className="flex flex-col">
                            {/* Hiển thị ngày đặt hàng ngay trên Mã đơn */}
                            <p className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-medium flex items-center gap-2">
                              Order Reference •{" "}
                              {new Date(order.createdAt).toLocaleDateString(
                                "vi-VN",
                              )}
                            </p>
                            <h3 className="text-base dark:text-white uppercase tracking-tighter leading-none">
                              #{order._id.slice(-8)}...
                            </h3>
                          </div>

                          {/* Hiển thị Badge */}
                          <div className="flex items-center">
                            {renderStatusBadge(order.orderStatus)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-[8px] uppercase text-gray-400 mb-1">
                            Total Amount
                          </p>
                          <p className="text-xl font-light dark:text-white">
                            ${Number(order.totalPrice).toFixed(2)}
                          </p>
                        </div>

                        <div className="col-span-2 flex flex-wrap gap-3 items-end">
                          {/* {order.orderStatus === "Delivered" && (
                            <button className="px-4 py-2 glass-card hover:glow-on-hover animate-smooth text-[10px] uppercase font-bold flex items-center gap-2 dark:text-white border border-white/10 rounded-xl bg-white/5">
                              <RefreshCw size={14} /> Reorder
                            </button>
                          )} */}

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
                          className="group relative flex items-center gap-2 px-6 py-3 border border-gray-200 dark:border-white/10 rounded-full overflow-hidden transition-all duration-500 hover:border-[#77cd3a]/50 hover:shadow-[0_0_20px_rgba(119,205,58,0.15)] text-gray-500 dark:text-gray-400"
                        >
                          <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-[#77cd3a] transition-colors duration-500">
                            Details
                          </span>
                          <ChevronRight
                            size={14}
                            className="relative z-10 transition-all duration-500 group-hover:text-[#77cd3a] group-hover:translate-x-1"
                          />
                          <div className="absolute inset-0 bg-[#77cd3a]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </Link>
                      ) : (
                        <span className="text-[9px] text-gray-400 uppercase tracking-widest italic">
                          Login required
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400 uppercase tracking-[0.3em] text-xs italic">
                  No orders found.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};
const OrderImage = ({ src }) => {
  const [isError, setIsError] = useState(false);

  if (!src || isError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-lg">
        <Package className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="Product"
      className="w-full h-full object-cover rounded-lg"
      onError={() => setIsError(true)}
    />
  );
};
const renderStatusBadge = (status) => {
  const statusConfig = {
    Processing: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    Shipped: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Delivered: "bg-[#77cd3a]/10 text-[#77cd3a] border-[#77cd3a]/20",
    Canceled: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const currentConfig = statusConfig[status] || statusConfig.Processing;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${currentConfig}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {status}
    </span>
  );
};

export default Orders;
