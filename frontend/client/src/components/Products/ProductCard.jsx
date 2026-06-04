import React from "react";
import { Star, Plus, Leaf, Carrot, Citrus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { useCartActions } from "../../hooks/useCartActions";
import { trackClickThunk } from "../../store/slices/interactionSlice";
import { useProductNavigation } from "../../hooks/useProductNavigation";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { handleCartAction } = useCartActions();

  const { handleProductClick } = useProductNavigation();

  // Hàm render Tag Giảm giá / Best Seller đồng bộ logic từ Slider
  const renderProductTag = () => {
    let tagText = product.tag;
    let tagClass =
      "bg-neutral-900/10 text-neutral-800 dark:bg-white/10 dark:text-neutral-200";

    if (!tagText) {
      if (product.discount > 0) {
        tagText = `-${product.discount}%`;
        tagClass = "bg-rose-500 text-white font-medium";
      } else if (product.ratings >= 4.8) {
        tagText = "Best Seller";
        tagClass = "bg-[#77cd3a] text-white font-medium";
      } else {
        return null;
      }
    }

    return (
      <span
        className={`absolute top-2 right-2 sm:top-4 sm:right-4 z-10 px-1.5 py-0.5 sm:px-2.5 rounded-full text-[8px] sm:text-[9px] font-bold tracking-wider sm:tracking-wide uppercase select-none shadow-xs backdrop-blur-md max-w-[70px] sm:max-w-none truncate text-center ${tagClass}`}
      >
        {tagText}
      </span>
    );
  };

  return (
    <div
      className="group relative w-full h-full cursor-pointer"
      onClick={() => handleProductClick(product._id)}
    >
      {/* CONTAINER CARD */}
      <div className="relative flex flex-col h-full bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-[2rem] overflow-hidden border border-neutral-100 dark:border-neutral-800/60 shadow-sm lg:hover:border-[#77cd3a]/40 lg:hover:shadow-[0_20px_40px_rgba(119,205,58,0.06)] transition-all duration-300 transform-gpu">
        {/* 1. BACKGROUND GRADIENT HOVER (Từ Slider) */}
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#77cd3a]/4 via-transparent to-transparent lg:group-hover:from-[#77cd3a]/18 lg:group-hover:via-[#77cd3a]/4 transition-all duration-300 pointer-events-none z-0" />

        {/* 2. HỆ THỐNG ICON RAU CỦ TRÔI NỔI (Từ Slider) */}
        <div className="absolute inset-0 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 overflow-hidden">
          <div className="absolute bottom-16 -left-1 w-5 h-5 text-[#77cd3a]/25 dark:text-[#77cd3a]/15 -rotate-12 transform lg:group-hover:animate-float-slow">
            <Carrot size={18} />
          </div>

          <div className="absolute top-1/2 -right-2 w-5 h-5 text-[#77cd3a]/20 dark:text-[#77cd3a]/10 rotate-45 transform lg:group-hover:animate-float-fast">
            <Citrus size={16} />
          </div>

          <div className="absolute top-16 left-2 w-4 h-4 text-[#77cd3a]/25 dark:text-[#77cd3a]/15 rotate-12 transform lg:group-hover:animate-float-medium">
            <Leaf size={14} fill="currentColor" />
          </div>

          <div className="absolute bottom-20 right-3 w-1.5 h-1.5 rounded-full bg-[#77cd3a]/30 lg:group-hover:animate-pulse" />
        </div>

        {/* 3. CONTAINER ẢNH (Aspect Ratio 1:1 hình vuông chuẩn chỉnh) */}
        <div className="relative w-full aspect-square overflow-hidden z-10">
          <div className="w-full h-full flex items-center justify-center p-3 sm:p-4">
            <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl border border-neutral-100 dark:border-white/5 bg-neutral-50 dark:bg-neutral-900/50 shadow-inner">
              <img
                src={product.images?.[0]?.url || "/placeholder.png"}
                alt={product.name}
                className="w-[85%] h-[85%] object-contain lg:group-hover:scale-[1.04] transition-transform duration-500 ease-out mix-blend-multiply dark:mix-blend-screen dark:invert"
              />
            </div>
          </div>

          {/* Rating Tag */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex items-center gap-0.5 sm:gap-1 bg-white/90 dark:bg-neutral-950/90 px-1.5 py-0.5 rounded-md backdrop-blur-md border border-neutral-200/30 dark:border-neutral-800/50">
            <Star size={8} fill="#77cd3a" className="text-[#77cd3a]" />
            <span className="text-[9px] font-bold text-neutral-600 dark:text-neutral-400">
              {product.ratings?.toFixed(1) || "0.0"}
            </span>
          </div>

          {renderProductTag()}
        </div>

        {/* Thanh phân cách mỏng */}
        <div className="mx-4 sm:mx-8 h-[1px] bg-neutral-100 dark:bg-neutral-800/40 relative z-10" />

        {/* 4. THÔNG TIN SẢN PHẨM */}
        <div className="px-3 py-4 sm:px-6 sm:py-6 text-center relative z-20 bg-transparent flex-1 flex flex-col justify-between">
          <h3 className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1 sm:mb-1.5 truncate lg:group-hover:text-neutral-950 dark:lg:group-hover:text-white transition-colors duration-200 leading-tight">
            {product.name}
          </h3>
          <div className="flex flex-col xs:flex-row items-center justify-center gap-0.5 xs:gap-1">
            <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
              ${product.price?.toFixed(2)}
            </span>
            <span className="text-[8px] sm:text-[9px] text-neutral-400 font-medium uppercase tracking-tight">
              / per kg
            </span>
          </div>
        </div>

        {/* 5. NÚT GIỎ HÀNG (Ẩn trên desktop khi không hover, hiện trên mobile) */}
        {product.stock > 0 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCartAction(product, "ADD", 1);
            }}
            className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 md:bottom-[82px] md:right-5 w-8 h-8 sm:w-9 sm:h-9 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 rounded-full flex items-center justify-center shadow-xs active:scale-90 md:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 hover:!bg-[#77cd3a] hover:!text-white z-30 cursor-pointer"
            aria-label="Add to cart"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* TẬP HỢP ANIMATION CHỐNG XUNG ĐỘT CPU */}
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(-12deg); }
          50% { transform: translateY(-5px) rotate(-16deg); }
        }
        @keyframes floatMedium {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(12deg); }
          50% { transform: translateY(-4px) translateX(3px) rotate(9deg); }
        }
        @keyframes floatFast {
          0%, 100% { transform: translateY(0px) rotate(45deg); }
          50% { transform: translateY(-6px) rotate(38deg); }
        }

        .lg\\:group-hover\\:animate-float-slow { animation: floatSlow 5s ease-in-out infinite; }
        .lg\\:group-hover\\:animate-float-medium { animation: floatMedium 4s ease-in-out infinite; }
        .lg\\:group-hover\\:animate-float-fast { animation: floatFast 3.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default ProductCard;
