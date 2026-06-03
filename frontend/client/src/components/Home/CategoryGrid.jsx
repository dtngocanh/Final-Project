import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../store/slices/categorySlice";

const CategoryGrid = () => {
  const categoryImages = {
    "Fresh Meat":"/meat123.png",
    Seafood: "/seafood.jpg",
    "Convenience Foods": "/egg.png",
    Fruits: "/apple.png",
    Vegetables: "/xalach.png",
    Packages: "/juice.png",
  };

  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const displayCat = useMemo(() => {
    if (!categories) return [];
    return categories.map((cat) => ({
      ...cat,
      image: categoryImages[cat.name] || "/placeholder.png",
    }));
  }, [categories]);

  if (displayCat.length === 0) return null;

  return (
    <section className="relative py-10 md:py-20 bg-white dark:bg-[#0a0a0a] transition-colors duration-700 overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-32 h-32 md:w-64 md:h-64 bg-[#77cd3a]/10 rounded-full blur-[50px] md:blur-[120px] dark:opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* HEADER */}
        <div className="flex flex-col items-center mb-8 md:mb-14 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.6 }}
            className="flex items-center gap-1.5 mb-1"
          >
            <span className="w-4 h-[1px] bg-[#77cd3a]" />
            <span className="uppercase tracking-[0.3em] text-[8px] font-black text-[#025c37] dark:text-[#77cd3af2]">
              Marketplace
            </span>
            <span className="w-4 h-[1px] bg-[#77cd3a]" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-4xl font-light text-gray-900 dark:text-white tracking-tight leading-tight"
          >
            Veganic{" "}
            <span className="font-serif italic border-b border-[#77cd3af2]/30 text-[#025c37] dark:text-[#77cd3af2]">
              Category
            </span>
          </motion.h2>
        </div>

        {/* RESPONSIVE LAYOUT CHUẨN: 
            - Mobile (<640px): 3 cột (chia thành 2 hàng, tổng 6 ô cực xinh)
            - Tablet/Desktop (>=640px): 6 cột thẳng tắp trên 1 hàng */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-4 lg:gap-6">
          {displayCat.slice(0, 6).map((cat, index) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.4 }}
              viewport={{ once: true }}
            >
              <Link
                to={`/products?subCatId=${cat._id}`}
                className="group relative block"
              >
                {/* CARD BOX: aspect-square chuẩn ô vuông, p-3 vừa vặn cho layout 3 cột */}
                <div className="relative aspect-square overflow-hidden bg-neutral-50/70 dark:bg-[#111] border border-neutral-100 dark:border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:bg-white dark:group-hover:bg-neutral-900 group-hover:border-[#77cd3af2]/30 group-hover:shadow-[0_8px_25px_rgba(119,205,58,0.06)] transform-gpu">
                  
                  {/* Image Container */}
                  <div className="relative h-[65%] sm:h-[70%] w-full flex items-center justify-center">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="max-h-[85%] max-w-[85%] object-contain drop-shadow-md custom-responsive-float"
                      style={{
                        animationDelay: `${index * 0.25}s`
                      }}
                    />
                  </div>

                  {/* Label & Text */}
                  <div className="absolute bottom-2 left-1.5 right-1.5 sm:bottom-3 sm:left-3 sm:right-3 flex flex-col items-center text-center">
                    <span className="text-[10px] sm:text-xs lg:text-sm font-medium tracking-wide text-neutral-700 dark:text-neutral-300 group-hover:text-[#77cd3a] transition-colors duration-300 truncate w-full px-0.5">
                      {cat.name}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CSS TRANSITION ĐA THIẾT BỊ - SIÊU MƯỢT KHÔNG LAG PHẦN CỨNG */}
      <style>{`
        .custom-responsive-float {
          animation: responsiveFloat 4s ease-in-out infinite;
          will-change: transform;
          transform: translateZ(0);
          transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
        }

        /* Chỉ phóng to thẻ và dừng float khi dùng chuột (Desktop) để tránh lỗi giật giật trên Mobile */
        @media (min-width: 1024px) {
          .group:hover .custom-responsive-float {
            transform: scale3d(1.1, 1.1, 1) translate3d(0, -5px, 0) !important;
            animation-play-state: paused;
          }
        }

        @keyframes responsiveFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -4px, 0); /* Độ nảy 4px vừa vặn hoàn hảo */
          }
        }
      `}</style>
    </section>
  );
};

export default CategoryGrid;