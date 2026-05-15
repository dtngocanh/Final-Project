import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DollarSign,
  Users,
  Package,
  ShoppingBasket,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  LayoutDashboard,
  Download,
  Sparkles,
  Star,
  Sun,
  Moon,
  Coffee,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

// Import các thunks của bạn
import { fetchAllOrders } from "../store/slices/orderSlice";
import { fetchAllProducts } from "../store/slices/productsSlice";
import { fetchAllUsers } from "../store/slices/adminSlice";

import FloatingVegetables from "./Fruit/FloatingVegetables";

const Dashboard = () => {
  const dispatch = useDispatch();

  const { orders } = useSelector((state) => state.order);
  const { products } = useSelector((state) => state.product);
  const { users, totalUsers } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAllOrders());
    dispatch(fetchAllProducts());
    dispatch(fetchAllUsers({ page: 1 }));
  }, [dispatch]);

  // --- LOGIC XỬ LÝ LỜI CHÀO ---
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12)
      return {
        text: "Good morning",
        icon: Sun,
        sub: "“Hope your business goes smoothly today!",
      };
    if (hour < 18)
      return {
        text: "Good afternoon",
        icon: Coffee,
        sub: "Check how many new orders you have today.",
      };
    return {
      text: "Good evening",
      icon: Moon,
      sub: "Wrap up the day with impressive numbers!",
    };
  };
  const greeting = getGreeting();

  // --- LOGIC XUẤT FILE ---
  const handleExportData = () => {
    toast.info("Creating file...");
    // Giả lập tạo file CSV
    const headers = ["Order ID, Customer, Total, Status\n"];
    const rows = orders.map(
      (o) =>
        `${o._id},${o.shippingInfo.fullName},${o.totalPrice},${o.orderStatus}\n`,
    );
    const blob = new Blob([headers, ...rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Veganic-Revenue-${new Date().toLocaleDateString()}.csv`;
    a.click();
    toast.success("Export file succesfully!");
  };

  // --- LOGIC THỐNG KÊ ---
  const stats = useMemo(() => {
    const revenue =
      orders?.reduce(
        (acc, o) =>
          o.orderStatus !== "Canceled" ? acc + (o.totalPrice || 0) : acc,
        0,
      ) || 0;
    const lowStockItems = products?.filter((p) => p.stock < 10) || [];

    // Cập nhật đầy đủ các trạng thái theo yêu cầu của bạn
    const orderAnalysis = [
      {
        name: "Pending",
        count: orders?.filter((o) => o.orderStatus === "Pending").length || 0,
        color: "#ffb800",
      },
      {
        name: "Processing",
        count:
          orders?.filter((o) => o.orderStatus === "Processing").length || 0,
        color: "#8b5cf6",
      }, // Tím cho Processing
      {
        name: "Shipped",
        count: orders?.filter((o) => o.orderStatus === "Shipped").length || 0,
        color: "#1890ff",
      }, // Xanh cho Shipped
      {
        name: "Delivered",
        count: orders?.filter((o) => o.orderStatus === "Delivered").length || 0,
        color: "#77cd3af2",
      },
      {
        name: "Canceled",
        count: orders?.filter((o) => o.orderStatus === "Canceled").length || 0,
        color: "#ff4d4f",
      },
    ];

    return {
      revenue,
      lowStockCount: lowStockItems.length,
      orderAnalysis,
      lowStockItems,
    };
  }, [orders, products]);

  return (
    <div className="min-h-screen bg-[#f8fafb] font-['Fredoka'] relative overflow-hidden pb-20 text-gray-800">
      <FloatingVegetables activeColor="#77cd3af2" />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-10">
        {/* HEADER & WELCOME */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white rounded-xl shadow-sm text-yellow-500">
                <greeting.icon size={20} />
              </div>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                {greeting.text},  {user?.name || "Veganic Seller"}
              </span>
            </div>
            <h1 className="text-4xl font-light">
              Veganic{" "}
              <span className="text-[#77cd3af2] font-serif italic">
                Dashboard
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">{greeting.sub}</p>
          </motion.div>

          <div className="flex gap-3">
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <Download size={16} className="text-[#77cd3af2]" /> Export Revenue
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl text-xs font-bold shadow-lg hover:bg-black transition-all">
              <Sparkles size={16} className="text-yellow-400" /> AI Insights
            </button>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            icon={DollarSign}
            color="#77cd3af2"
            sub="Net Earnings"
          />
          <StatCard
            title="Total Orders"
            value={orders?.length || 0}
            icon={ShoppingBasket}
            color="#ffb800"
            sub="All Statuses"
          />
          <StatCard
            title="Customers"
            value={totalUsers || 0}
            icon={Users}
            color="#1890ff"
            sub="Active Users"
          />
          <StatCard
            title="Low Stock"
            value={stats.lowStockCount}
            icon={Package}
            color="#f97316"
            sub="Needs Attention"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ORDER ANALYSIS CHART */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-gray-100"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
              <TrendingUp className="text-[#77cd3af2]" size={20} /> Logistics
              Overview
            </h3>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.orderAnalysis}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#999", fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#999" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8faf9" }}
                    contentStyle={{
                      borderRadius: "20px",
                      border: "none",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                    }}
                  />
                  <Bar dataKey="count" radius={[12, 12, 0, 0]} barSize={45}>
                    {stats.orderAnalysis.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* NEW LIGHT-MODE STOCK ALERTS */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[40px] p-8 shadow-sm border border-orange-100 relative overflow-hidden"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <AlertTriangle className="text-orange-500" size={20} /> Inventory
              Alert
            </h3>

            <div className="space-y-4 relative z-10">
              {stats.lowStockItems.length > 0 ? (
                stats.lowStockItems.slice(0, 5).map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 bg-orange-50/50 p-3 rounded-2xl border border-orange-100/50 hover:bg-orange-50 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-sm">
                      <img
                        src={item.images?.[0]?.url}
                        alt=""
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-700 truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">
                        Only {item.stock} in stock
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center text-gray-400 italic text-sm">
                  The stock is in safe status
                </div>
              )}
            </div>

            <button className="w-full mt-8 py-4 bg-orange-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all">
              Manage Inventory
            </button>

            {/* Light Decoration */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-100 opacity-20 rounded-full blur-3xl"></div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, sub }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-50 flex flex-col gap-4 relative overflow-hidden group"
  >
    <div className="flex justify-between items-start relative z-10">
      <div
        className="p-3 rounded-2xl transition-colors group-hover:bg-white"
        style={{ backgroundColor: `${color}15`, color: color }}
      >
        <Icon size={24} />
      </div>
      <div className="p-1 bg-gray-50 rounded-lg group-hover:bg-[#77cd3af2] group-hover:text-white transition-all">
        <ArrowUpRight size={14} />
      </div>
    </div>
    <div className="relative z-10">
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
        {title}
      </p>
      <h2 className="text-3xl font-black text-gray-800 tracking-tight">
        {value}
      </h2>
      <p className="text-[10px] text-gray-400 mt-2 font-medium italic">{sub}</p>
    </div>
  </motion.div>
);

export default Dashboard;
