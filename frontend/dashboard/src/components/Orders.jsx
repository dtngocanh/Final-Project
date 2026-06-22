import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllOrders,
  updateOrderStatus,
  resetStatus,
} from "../store/slices/orderSlice";
import {
  Eye,
  Trash2,
  ShoppingBag,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  User,
  Hash,
  RefreshCw, // Thêm icon update
  CreditCard,
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import FloatingVegetables from "./Fruit/FloatingVegetables";
import OrderDetailsModal from "../modals/OrderDetailsModal";
import FruitLoader from "./Fruit/FruitLoader";

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, success, totalPages, totalOrders } = useSelector(
    (state) => state.order,
  );

  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    dispatch(
      fetchAllOrders({
        page: currentPage,
        limit: itemsPerPage,
        status: filterStatus,
        search: searchTerm || undefined,
      }),
    );
  }, [dispatch, currentPage, filterStatus]);

  // Thông báo khi update thành công
  useEffect(() => {
    if (success) {
      dispatch(resetStatus());
    }
  }, [success, dispatch]);

  // --- PHÂN TRANG ---
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // --- XỬ LÝ CẬP NHẬT TRẠNG THÁI ---
  const handleStatusChange = (id, newStatus) => {
    dispatch(updateOrderStatus({ id: id, status: newStatus }));
  };

  const handleExportCSV = () => {
    if (orders.length === 0) return toast.warning("No data to export!");
    const headers = [
      "Order ID",
      "Customer",
      "Total",
      "Method",
      "Status",
      "Date",
    ];
    const csvData = orders.map((order) =>
      [
        `#${order._id.slice(-6).toUpperCase()}`,
        order.shippingInfo.fullName,
        order.totalPrice.toFixed(2),
        order.paymentInfo?.method || "COD",
        order.orderStatus,
        new Date(order.createdAt).toLocaleDateString("vi-VN"),
      ].join(","),
    );
    const blob = new Blob([headers.join(",") + "\n" + csvData.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Orders-${new Date().toLocaleDateString()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported successfully!");
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-50 text-green-600 border-green-100";
      case "Processing":
        return "bg-purple-50 text-purple-600 border-purple-100";
      case "Shipped":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "Canceled":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-orange-50 text-orange-600 border-orange-100";
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#f8fafb] pb-20 font-['Fredoka']">
      <FloatingVegetables activeColor="#77cd3af2" />

      <div className="relative z-10 p-4 md:p-10 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-light text-gray-800">
              Customer{" "}
              <span className="text-[#77cd3af2] font-serif italic">Orders</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2 font-medium">
              Manage and track organic produce orders.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-gray-700 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-xs font-black uppercase tracking-widest active:scale-95"
            >
              <Download size={18} className="text-[#77cd3af2]" /> Export Orders
            </button>
            <div className="relative w-full sm:w-80">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                size={20}
                onClick={() => {
                  dispatch(
                    fetchAllOrders({
                      page: 1,
                      limit: itemsPerPage,
                      status: filterStatus,
                      search: searchTerm,
                    }),
                  );
                  setCurrentPage(1);
                }}
              />
              <input
                type="text"
                placeholder="Find ID or name..."
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-sm border border-gray-100 focus:ring-2 focus:ring-[#77cd3af2] outline-none text-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    dispatch(
                      fetchAllOrders({
                        page: 1,
                        limit: itemsPerPage,
                        status: filterStatus,
                        search: searchTerm,
                      }),
                    );
                    setCurrentPage(1);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            "All",
            "Pending",
            "Processing",
            "Shipped",
            "Delivered",
            "Canceled",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setFilterStatus(tab);
                setCurrentPage(1);
              }}
              className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${filterStatus === tab ? "bg-gray-800 text-white shadow-xl scale-105" : "bg-white text-gray-400 border border-gray-100"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* MAIN CONTENT */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FruitLoader />
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-md rounded-[40px] shadow-2xl shadow-green-900/5 border border-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                  <tr>
                    <th className="px-8 py-6 flex items-center gap-2">
                      <Hash size={14} /> ID
                    </th>
                    <th className="px-6 py-6">
                      <User size={14} className="inline mr-2" /> Customer
                    </th>
                    <th className="px-6 py-6 text-center font-black">Amount</th>
                    <th className="px-6 py-6">
                      <CreditCard size={14} className="inline mr-2" /> Payment
                    </th>
                    <th className="px-6 py-6 text-center">Manage</th>
                    <th className="px-6 py-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={order._id}
                        className="hover:bg-[#fcfdfd] group transition-all"
                      >
                        <td className="px-8 py-6">
                          <span className="font-bold text-gray-400 text-[10px] bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                            #{order._id?.slice(-6).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <p className="font-bold text-gray-800">
                            {order.shippingInfo.fullName}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                            <Calendar size={10} />{" "}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className="font-black text-[#77cd3af2] text-base">
                            ${order.totalPrice?.toLocaleString()}
                          </span>
                        </td>

                        {/* HIỂN THỊ THANH TOÁN */}
                        <td className="px-6 py-6">
                          <p className="text-[10px] font-black text-gray-600 uppercase leading-none">
                            {order.paymentInfo?.method || "COD"}
                          </p>
                          <p
                            className={`text-[8px] font-bold mt-1 ${order.paymentInfo?.status === "Paid" ? "text-green-500" : "text-red-400"}`}
                          >
                            {order.paymentInfo?.status === "Paid"
                              ? "● PAID"
                              : "● UNPAID"}
                          </p>
                        </td>

                        {/* NÚT XỬ LÝ ĐƠN HÀNG NHANH */}
                        <td className="px-6 py-6 text-center">
                          <select
                            value={order.orderStatus}
                            onChange={(e) =>
                              handleStatusChange(order._id, e.target.value)
                            }
                            disabled={
                              order.orderStatus === "Delivered" ||
                              order.orderStatus === "Canceled"
                            }
                            className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase border shadow-sm outline-none cursor-pointer transition-all ${getStatusStyle(order.orderStatus)}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Canceled">Canceled</option>
                          </select>
                        </td>

                        <td className="px-6 py-6 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-800 hover:text-white transition-all transform hover:scale-110 shadow-sm"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("Delete?"))
                                  toast.error("Deleted");
                              }}
                              className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 shadow-sm"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-32 opacity-40 italic"
                      >
                        <ShoppingBag
                          size={80}
                          className="mx-auto mb-4 text-gray-200 stroke-1"
                        />
                        Empty stock...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="px-8 py-6 bg-gray-50/30 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  Page <span className="text-gray-800">{currentPage}</span> /{" "}
                  {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-3 rounded-xl bg-white border border-gray-200 text-gray-400 disabled:opacity-30 hover:text-[#77cd3af2] transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex gap-1.5">
                    {renderPageNumbers().map((p, i) =>
                      p === "..." ? (
                        <span
                          key={i}
                          className="w-10 h-10 flex items-center justify-center text-gray-400"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(p)}
                          className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === p ? "bg-[#77cd3af2] text-white shadow-lg" : "bg-white text-gray-400 border border-gray-100"}`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-xl bg-white border border-gray-200 text-gray-400 disabled:opacity-30 hover:text-[#77cd3af2] transition-all"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
