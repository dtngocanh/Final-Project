import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // 1. Import useSelector để lấy data từ Redux
import {
  fetchAllProducts,
  restockProductLogs,
} from "../../store/slices/productsSlice";
import PurchaseOrderModal from "./PurchaseOrderModal";
import { useState } from "react";
import ExpiryAlerts from "./ExpiryAlerts";
import { Package, ArrowLeft, DollarSign, AlertCircle, TrendingDown } from "lucide-react";

const InventoryOverview = () => {
  const dispatch = useDispatch();

  // 2. Lấy danh sách sản phẩm từ Redux Store (slice product)
  const { products, restockLogs } = useSelector((state) => state.product);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllProducts({ limit: 1000 }));
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

    if (restockLogs && restockLogs.length > 0) {
      restockLogs.forEach((log) => {
        const qtyAdded = log.quantityAdded || 0;
        const costPrice = log.costPrice || 0;
        totalValue += qtyAdded * costPrice; // Tích lũy: Số lượng nhập * Giá gốc nhập
      });
    }

    products.forEach((product) => {
      const stock = product.stock || 0;
      const price = product.price || 0;
      const sold = product.salesCount || 0;

      const category =
        typeof product.category === "object" && product.category?.name
          ? product.category.name
          : product.categoryName || "Uncategorized";

      totalQty += stock;
      if (stock === 0) stockOutCount++;

      if (!categoryData[category]) {
        categoryData[category] = {
          qty: 0,
          value: 0,
          totalSold: 0,
        };
      }

      categoryData[category].qty += stock;
      categoryData[category].value += stock * price;
      categoryData[category].totalSold += sold;
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
      title: "Total Stock",
      value: formatNumber(stats.totalQty),
      sub: "Available items",
      change: "Live",
      icon: Package,
      color: "bg-blue-50 text-blue-600",
      ring: "from-blue-500/10 to-blue-100/20",
    },
    {
      title: "Inventory Value",
      value: `$${stats.totalValue.toLocaleString()}`,
      sub: "Inbound cost",
      change: "Updated",
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-600",
      ring: "from-emerald-500/10 to-emerald-100/20",
    },
    {
      title: "Out of Stock",
      value: stats.stockOutCount,
      sub: "Need replenishment",
      change: "Alert",
      icon: AlertCircle,
      color: "bg-rose-50 text-rose-600",
      ring: "from-rose-500/10 to-rose-100/20",
    },
    {
      title: "Critical Ratio",
      value: products?.length
        ? ((stats.stockOutCount / products.length) * 100).toFixed(1) + "%"
        : "0%",
      sub: "Low inventory risk",
      change: "Monitor",
      icon: TrendingDown,
      color: "bg-amber-50 text-amber-600",
      ring: "from-amber-500/10 to-amber-100/20",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafb] p-6 font-['Fredoka'] text-gray-800">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {topStats.map((stat, idx) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={idx}
              whileHover={{
                y: -6,
                scale: 1.02,
              }}
              transition={{ duration: 0.2 }}
              className={`
          relative overflow-hidden
          rounded-[32px]
          bg-gradient-to-br ${stat.ring}
          border border-white/60
          backdrop-blur-sm
          p-6
          shadow-sm hover:shadow-xl
        `}
            >
              {/* Background Circle */}
              <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/40" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-gray-400">
                      {stat.title}
                    </p>

                    <h2 className="text-3xl font-black text-gray-800 mt-3">
                      {stat.value}
                    </h2>
                  </div>

                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${stat.color}`}
                  >
                    <Icon size={26} />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/50 pt-4">
                  <span className="text-sm text-gray-500">{stat.sub}</span>

                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                      stat.change === "Alert"
                        ? "bg-rose-100 text-rose-600"
                        : stat.change === "Monitor"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
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
            onClose={() => {
              setIsModalOpen(false);
              dispatch(restockProductLogs());
            }}
            products={products}
          />
        </div>

        {/* BLOCK 3: DỮ LIỆU THẬT - PHÂN BỔ SẢN PHẨM THEO DANH MỤC */}
        {/* BLOCK 3: CATEGORY ALLOCATION (QUANTITY, VALUE & SALES VELOCITY) */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">
              Category Allocation
            </h3>
            <p className="text-xs text-gray-400">
              Detailed breakdown of quantity, inventory value, and sales
              velocity
            </p>
          </div>

          <div className="space-y-5 my-4 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
            {Object.keys(stats.categoryData).length > 0 ? (
              Object.entries(stats.categoryData).map(
                ([category, data], idx) => {
                  const percentage = stats.totalQty
                    ? ((data.qty / stats.totalQty) * 100).toFixed(1)
                    : 0;

                  // Smart sales velocity status badges in English
                  let velocityBadge = (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                      Stable
                    </span>
                  );
                  if (data.totalSold > 50) {
                    velocityBadge = (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 animate-pulse">
                        Hot Seller 🔥
                      </span>
                    );
                  } else if (data.qty > 0 && data.totalSold <= 5) {
                    velocityBadge = (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100">
                        Slow Moving ⚠️
                      </span>
                    );
                  }

                  return (
                    <div
                      key={idx}
                      className="text-xs border-b border-gray-50/50 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <div>
                          <span className="text-gray-800 font-bold capitalize text-[13px] block">
                            {category}
                          </span>
                          <div className="flex gap-2 mt-1 items-center">
                            {velocityBadge}
                            <span className="text-[10px] text-gray-400">
                              Sold: {data.totalSold}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-900 font-black block text-[13px]">
                            {data.qty.toLocaleString()} pcs ({percentage}%)
                          </span>
                          {/* <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
                            Value: ${data.value.toLocaleString()}
                          </span> */}
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100 mt-2">
                        <div
                          className={`h-full rounded-full ${data.totalSold > 50 ? "bg-emerald-500" : "bg-[#77cd3af2]"}`}
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
        </div>
      </div>
      <div className="w-full my-8">
        <ExpiryAlerts />
      </div>
    </div>
  );
};

export default InventoryOverview;
