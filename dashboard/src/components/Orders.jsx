import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders } from "../store/slices/orderSlice";
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
  Hash
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import FloatingVegetables from "./Fruit/FloatingVegetables"; 
import OrderDetailsModal from "./OrderDetailsModal";

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);
  
  // States
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  // --- LOGIC LỌC & TÌM KIẾM ---
  const filteredOrders = useMemo(() => {
    return (orders || []).filter(order => {
      const matchesStatus = filterStatus === "All" || order.orderStatus === filterStatus;
      const matchesSearch = 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, filterStatus, searchTerm]);

  // --- LOGIC XUẤT FILE CSV ---
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      return toast.warning("No data available to export!");
    }

    // Tiêu đề cột
    const headers = ["Order ID", "Customer", "Phone", "Email", "Total Price", "Status", "Date"];
    
    // Xây dựng nội dung file
    const csvData = filteredOrders.map(order => [
      `#${order._id.slice(-6).toUpperCase()}`,
      order.shippingInfo.fullName,
      order.shippingInfo.phone,
      order.user?.email || "N/A",
      order.totalPrice.toFixed(2),
      order.orderStatus,
      new Date(order.createdAt).toLocaleDateString('vi-VN')
    ].join(","));

    const blob = new Blob([headers.join(",") + "\n" + csvData.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Veganic-Orders-${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Order report has been exported!");
  };

  // --- LOGIC PHÂN TRANG ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to delete this order?")) {
      toast.error(`Đã xóa đơn hàng ${id.slice(-6).toUpperCase()}`);
      // dispatch(deleteOrder(id)); 
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-50 text-green-600 border-green-100';
      case 'Processing': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Canceled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-orange-50 text-orange-600 border-orange-100';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#f8fafb] pb-20">
      <FloatingVegetables activeColor="#77cd3af2" />

      <div className="relative z-10 p-4 md:p-10 font-['Fredoka'] max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-light text-gray-800">
              Customer <span className="text-[#77cd3af2] font-serif italic">Orders</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2 font-medium">Manage and track your organic produce orders.</p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <button 
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-gray-700 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-xs font-black uppercase tracking-widest active:scale-95"
            >
              <Download size={18} className="text-[#77cd3af2]" /> Export Orders
            </button>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input 
                type="text" 
                placeholder="Find ID of client's name..."
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-sm border border-gray-100 focus:ring-2 focus:ring-[#77cd3af2] outline-none transition-all text-sm"
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
              />
            </div>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["All", "Pending", "Processing", "Shipped", "Delivered", "Canceled"].map((tab) => (
            <button
              key={tab}
              onClick={() => {setFilterStatus(tab); setCurrentPage(1);}}
              className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                filterStatus === tab 
                ? "bg-gray-800 text-white shadow-xl scale-105" 
                : "bg-white text-gray-400 hover:bg-gray-50 border border-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white/80 backdrop-blur-md rounded-[40px] shadow-sm border border-white overflow-hidden shadow-2xl shadow-green-900/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                <tr>
                  <th className="px-8 py-6 flex items-center gap-2"><Hash size={14}/> ID</th>
                  <th className="px-6 py-6"><User size={14} className="inline mr-2"/>Customer</th>
                  <th className="px-6 py-6 text-center font-black">Amount</th>
                  <th className="px-6 py-6">Status</th>
                  <th className="px-6 py-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-32 text-[#77cd3af2] animate-pulse font-bold tracking-[0.5em]">Data harvesting...</td></tr>
                ) : currentOrders.length > 0 ? (
                  currentOrders.map((order) => (
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
                        <p className="font-bold text-gray-800">{order.shippingInfo.fullName}</p>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                          <Calendar size={10}/> {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="font-black text-[#77cd3af2] text-base">${order.totalPrice?.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border shadow-sm ${getStatusStyle(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => setSelectedOrder(order)} 
                            className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-800 hover:text-white transition-all transform hover:scale-110 shadow-sm"
                            title="View Details"
                          >
                            <Eye size={18}/>
                          </button>
                          <button 
                            onClick={() => handleDelete(order._id)} 
                            className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 shadow-sm"
                            title="Delete"
                          >
                            <Trash2 size={18}/>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-32">
                      <div className="flex flex-col items-center opacity-40">
                        <ShoppingBag size={80} className="mb-4 text-gray-200 stroke-1" />
                        <p className="text-xl font-medium text-gray-400 italic">Empty stock...</p>
                      </div>
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
                Page <span className="text-gray-800">{currentPage}</span> / {totalPages}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-3 rounded-xl bg-white border border-gray-200 text-gray-400 disabled:opacity-30 hover:text-[#77cd3af2] transition-all shadow-sm"
                >
                  <ChevronLeft size={18} />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                      currentPage === i + 1 
                      ? "bg-[#77cd3af2] text-white shadow-lg shadow-green-200" 
                      : "bg-white text-gray-400 hover:bg-gray-100 border border-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-xl bg-white border border-gray-200 text-gray-400 disabled:opacity-30 hover:text-[#77cd3af2] transition-all shadow-sm"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL CHI TIẾT */}
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