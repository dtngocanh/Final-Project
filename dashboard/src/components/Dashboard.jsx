import React from "react";
import Header from "./Header";
import MiniSummary from "./dashboard-components/MiniSummary";
import TopSellingProducts from "./dashboard-components/TopSellingProducts";
import Stats from "./dashboard-components/Stats";
import MonthlySalesChart from "./dashboard-components/MonthlySalesChart";
import OrdersChart from "./dashboard-components/OrdersChart";
import TopProductsChart from "./dashboard-components/TopProductsChart";

const Dashboard = () => {
  return (
    <div className="flex-1 min-h-screen bg-white p-4 md:p-8 overflow-y-auto">
      {/* 1. Thanh Header trên cùng */}
      <Header />

      {/* 2. Các con số tổng quan (MiniSummary) */}
       {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MiniSummary />
      </div> */}

      {/* 3. Khu vực biểu đồ chính */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-gray-50/50 p-6 rounded-sm border border-gray-100">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-6">Monthly Revenue</h3>
          <MonthlySalesChart />
        </div> */}
        {/* <div className="bg-gray-50/50 p-6 rounded-sm border border-gray-100">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-6">Order Status</h3>
          <OrdersChart />
        </div>
      </div> */}

      {/* 4. Thống kê chi tiết & Sản phẩm bán chạy */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-6">
          <Stats />
          <div className="p-6 bg-white border border-gray-100 shadow-sm">
             <TopProductsChart />
          </div>
        </section>
        
        <section>
          <TopSellingProducts />
        </section>
      </div>  */}
    </div> 
  );
};

export default Dashboard;