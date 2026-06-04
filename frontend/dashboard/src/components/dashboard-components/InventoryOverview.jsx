import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // 1. Import useSelector để lấy data từ Redux
import {
  fetchAllProducts,
  restockProductLogs,
} from "../../store/slices/productsSlice";
import PurchaseOrderModal from "./PurchaseOrderModal";
import { useState } from "react";

const InventoryOverview = () => {
  const dispatch = useDispatch();

  // 2. Lấy danh sách sản phẩm từ Redux Store (slice product)
  const { products, restockLogs } = useSelector((state) => state.product);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(restockProductLogs());
  }, [dispatch]);
  // 3. Sử dụng useMemo để tính toán các chỉ số thực tế từ mảng sản phẩm
  const stats = useMemo(() => {
    if (!products || products.length === 0) {
      return {
        totalQty: 0,
        totalValue: 0,
        stockOutCount: 0,
        lowStockItems: [],
        categoryData: {},
      };
    }

    let totalQty = 0;
    let totalValue = 0;
    let stockOutCount = 0;
    const categoryData = {};

    products.forEach((product) => {
      const stock = product.stock || 0;
      const price = product.price || 0;

      const category =
        typeof product.category === "object" && product.category?.name
          ? product.category.name
          : product.categoryName || "Uncategorized";

      totalQty += stock;
      totalValue += stock * price;
      if (stock === 0) stockOutCount++;

      if (!categoryData[category]) {
        categoryData[category] = 0;
      }
      categoryData[category] += stock;
    });

    // Lọc ra các sản phẩm sắp hết hàng (stock < 10) hoặc đã hết hàng để hiển thị ở bảng chi tiết
    const lowStockItems = [...products].filter((p) => p.stock < 10).slice(0, 6); // Lấy tối đa 6 sản phẩm tiêu biểu

    return { totalQty, totalValue, stockOutCount, lowStockItems, categoryData };
  }, [products]);

  // Định dạng hiển thị số lượng lớn (M: Triệu, K: Ngàn)
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + " M";
    if (num >= 1000) return (num / 1000).toFixed(1) + " K";
    return num;
  };

  const topStats = [
    {
      title: "Total Stock Quantity",
      value: formatNumber(stats.totalQty),
      sub: "Available items",
      change: "Live",
      isUp: true,
    },
    {
      title: "Total Stock Value",
      value: `$${stats.totalValue.toLocaleString()}`,
      sub: "Inventory worth",
      change: "Live",
      isUp: true,
    },
    {
      title: "Out of Stock Items",
      value: stats.stockOutCount,
      sub: "Products at 0 stock",
      change: "Alert",
      isUp: stats.stockOutCount > 0 ? false : null,
    },
    // {
    //   title: "Average Lead Time",
    //   value: "15 Days",
    //   sub: "Standard logistics",
    //   change: "0.0%",
    //   isUp: null,
    // },
    {
      title: "Below Reorder %",
      value: products?.length
        ? ((stats.stockOutCount / products.length) * 100).toFixed(1) + "%"
        : "0%",
      sub: "Critical stock ratio",
      change: "Update",
      isUp: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafb] p-6 font-['Fredoka'] text-gray-800">
      {/* STYLE NÂNG CẤP SCROLLBAR SIÊU MƯỢT, TINH TẾ */}
      <style>{`
  /* 1. Áp dụng cho toàn bộ các vùng có class custom-scrollbar */
  .custom-scrollbar {
    scrollbar-width: thin; /* Dành cho Firefox */
    scrollbar-color: rgba(119, 205, 58, 0.2) transparent; /* Dành cho Firefox */
    scroll-behavior: smooth;
  }

  /* Kích thước vùng scrollbar (Chrome, Safari, Edge) */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  /* Phần nền đường ray - Giữ trong suốt để tạo cảm giác thoáng đạt */
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  /* Cục kéo scrollbar - Mặc định ẩn mờ */
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(119, 205, 58, 0.0);
    border-radius: 99px;
    transition: background 0.3s ease;
  }

  /* Khi hover vào toàn bộ khối chứa, cục kéo mới hiện rõ lên (Tránh thô kệch) */
  .custom-scrollbar:hover::-webkit-scrollbar-thumb {
    background: rgba(119, 205, 58, 0.25);
  }

  /* Khi rê chuột trực tiếp vào cục kéo - Đậm đà hơn để định vị vị trí */
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(119, 205, 58, 0.6) !important;
  }
`}</style>
      {/* HEADER BAR */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-3 bg-white hover:bg-emerald-50 text-[#77cd3af2] rounded-2xl shadow-sm transition-all border border-gray-100"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl font-light text-gray-900">
              Inventory{" "}
              <span className="text-[#77cd3af2] font-serif italic">
                Overview
              </span>
            </h1>
            <p className="text-xs text-gray-400">
              Real-time stock analytics & warehouse metrics
            </p>
          </div>
        </div>
        <div className="text-xs bg-[#77cd3af2] text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-green-100">
          Live Sync Active
        </div>
      </div>

      {/* TOP KPI MEASURES ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-8">
        {topStats.map((stat, idx) => (
          <motion.div
            whileHover={{ y: -4 }}
            key={idx}
            className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm relative overflow-hidden group"
          >
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
              {stat.title}
            </p>
            <h2 className="text-2xl font-black text-gray-800 mt-2 mb-1 tracking-tight group-hover:text-[#77cd3af2] transition-colors">
              {stat.value}
            </h2>
            <div className="flex items-center justify-between text-[11px] mt-3 pt-2 border-t border-gray-50">
              <span className="text-gray-400 font-medium">{stat.sub}</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-lg text-[10px] ${
                  stat.isUp === true
                    ? "text-emerald-600 bg-emerald-50"
                    : stat.isUp === false
                      ? "text-rose-600 bg-rose-50"
                      : "text-amber-600 bg-amber-50"
                }`}
              >
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* MAIN DATA GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* BLOCK 1: BẢNG SẢN PHẨM CẦN CHÚ Ý */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm col-span-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Stock Alerts</h3>
              <p className="text-[11px] text-gray-400">
                Products out of stock or running low
              </p>
            </div>
            <span className="text-[10px] bg-amber-50 text-amber-600 font-bold px-2.5 py-1 rounded-xl border border-amber-100">
              Attention Needed
            </span>
          </div>
          <div>
            <table className="w-full text-left text-xs whitespace-nowrap custom-scrollbar">
              <thead>
                <tr className="text-gray-400 font-black uppercase text-[10px] tracking-wider border-b border-gray-50">
                  <th className="pb-3">Product ID</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {stats.lowStockItems.length > 0 ? (
                  stats.lowStockItems.map((prod, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="py-3.5 font-medium text-gray-600 group-hover:text-gray-900 truncate max-w-[100px]">
                        {prod.name || `#${prod._id?.slice(-6).toUpperCase()}`}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-0.5 rounded-xl font-bold text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100">
                          {typeof prod.category === "object"
                            ? prod.category.name
                            : prod.category || "General"}
                          {/* {prod.categoryName} */}
                        </span>
                      </td>
                      <td
                        className={`py-3.5 text-right font-bold text-sm ${prod.stock === 0 ? "text-rose-500 font-black" : "text-amber-500"}`}
                      >
                        {prod.stock === 0
                          ? "Out of stock"
                          : `${prod.stock} left`}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="py-10 text-center text-gray-400 italic"
                    >
                      All products are well stocked!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BLOCK 2: RECENT RESTOCK LOG */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-800 text-lg">
                Recent Restock Log
              </h3>
              <span className="text-[9px] font-black uppercase tracking-wider text-[#77cd3af2] bg-green-50 px-2 py-0.5 rounded-md border border-green-100 animate-pulse">
                Inbound
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Latest stock replenishment activities
            </p>

            {/* Danh sách các đợt nhập kho */}
            <div className="space-y-4 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
              {restockLogs && restockLogs.length > 0 ? (
                restockLogs.map((log, idx) => (
                  <div
                    key={log._id || idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/60 hover:bg-emerald-50/30 border border-gray-100/50 transition-all group"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      {/* Mã log rút gọn */}
                      <span className="text-[10px] text-gray-400 font-bold">
                        #{log._id?.slice(-6).toUpperCase()}
                      </span>
                      {/* Tên sản phẩm lấy từ populate */}
                      <p className="text-xs font-bold text-gray-800 truncate group-hover:text-gray-900">
                        {log.product?.name || "Deleted Product"}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        From: {log.supplier}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      {/* Số lượng thực tế thêm vào đợt đó */}
                      <span className="text-xs font-black text-emerald-600 block">
                        +{log.quantityAdded} items
                      </span>
                      {/* Định dạng ngày giờ thật từ trường createdAt */}
                      <span className="text-[9px] font-bold text-gray-400 bg-white px-1.5 py-0.5 rounded-md border border-gray-100 mt-1 inline-block">
                        {new Date(log.createdAt).toLocaleString("en-US")}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-400 italic text-xs">
                  No recent inbound logs found.
                </div>
              )}
            </div>
          </div>

          {/* Nút hành động mở rộng phía dưới */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full mt-6 py-4 bg-emerald-50 text-[#77cd3af2] text-xs font-bold uppercase tracking-wider rounded-2xl hover:bg-[#77cd3af2] hover:text-white border border-emerald-100/60 transition-all active:scale-[0.98]"
          >
            Create New Purchase Order
          </button>

          <PurchaseOrderModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            products={products}
          />
        </div>

        {/* BLOCK 3: DỮ LIỆU THẬT - PHÂN BỔ SẢN PHẨM THEO DANH MỤC */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">
              Category Allocation
            </h3>
            <p className="text-xs text-gray-400">
              Total stock volume breakdown by product categories
            </p>
          </div>

          <div className="space-y-4 my-4 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
            {Object.keys(stats.categoryData).length > 0 ? (
              Object.entries(stats.categoryData).map(
                ([category, count], idx) => {
                  // Tính phần trăm phân bổ của danh mục đó
                  const percentage = stats.totalQty
                    ? ((count / stats.totalQty) * 100).toFixed(1)
                    : 0;

                  return (
                    <div key={idx} className="text-xs">
                      <div className="flex justify-between font-bold text-gray-700 mb-1.5">
                        <span className="text-gray-500 font-medium capitalize">
                          {category}
                        </span>
                        <span className="text-gray-900 font-black">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                        <div
                          className="h-full rounded-full bg-[#77cd3af2]"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                },
              )
            ) : (
              <div className="text-center py-10 text-gray-400 italic">
                No category data found
              </div>
            )}
          </div>

          {/* <button className="w-full py-4 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-2xl hover:bg-black shadow-md transition-all active:scale-[0.98]">
            Export Inventory Report
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default InventoryOverview;
