import React from "react";
import { useSelector } from "react-redux";
import ProductCard from "../Products/ProductCard";
import FloatingDecor from "../Fruit/FloatingDecor";

const RecentlyViewed = () => {
  // Lấy danh sách sản phẩm vừa xem từ Redux
  const recentlyViewedProducts = useSelector(
    (state) => state.interaction?.recentlyViewed || [],
  );

  // Ẩn hoàn toàn khu vực nếu chưa có sản phẩm nào
  if (!recentlyViewedProducts || recentlyViewedProducts.length === 0) {
    return null;
  }

  // Giới hạn hiển thị tối đa 5 sản phẩm để layout Grid luôn đẹp và chuẩn chỉ
  const displayedProducts = recentlyViewedProducts.slice(0, 5);

  return (
    <section className="relative w-full py-16 md:py-24 px-4 sm:px-8 lg:px-16 max-w-[1600px] mx-auto select-none bg-transparent">
      {/* Hiệu ứng bóng mờ nhẹ nhàng hai góc nền */}
      <FloatingDecor />

      {/* HEADER SECTION - Căn giữa hoàn hảo */}
      <div className="relative flex flex-col items-center text-center mb-12 md:mb-16 gap-2 z-10">
        {/* Label nhỏ phía trên */}
        <div className="flex items-center gap-3 text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#4a7c59]">
          <span className="w-6 h-[1px] bg-[#4a7c59]/40"></span>
          <span>History</span>
          <span className="w-6 h-[1px] bg-[#4a7c59]/40"></span>
        </div>

        {/* Tiêu đề chính thanh lịch */}
        <h4 className="text-2xl md:text-4xl font-light text-gray-900 dark:text-white tracking-tight leading-tight">
          <span className=" font-fredoka text-neutral-900 dark:text-neutral-100">
            Recently 
          </span>{" "}
          <span className="font-serif italic border-b border-[#77cd3af2]/30 text-[#025c37] dark:text-[#77cd3af2]">
            viewed
          </span>
        </h4>

        {/* Mô tả nhỏ */}
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md font-normal mt-1 leading-relaxed">
          Fresh organic items you have checked out during this visit.
        </p>
      </div>

      {/* PRODUCT GRID - Dàn trang tĩnh responsive căng đét */}
      <div className="relative z-10 px-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
          {displayedProducts.map((product) => (
            <div 
              key={`recent-${product._id}`} 
              className="w-full flex flex-col transform transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.2)] rounded-2xl"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;