import React, { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  Leaf,
} from "lucide-react";
import FloatingDecor from "../Fruit/FloatingDecor.jsx";
import { useCartActions } from "../../hooks/useCartActions";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchRecommendations } from "../../store/slices/recommendSlice.js";

const RecommendSlider = () => {
  const scrollRef = useRef(null);
  const dispatch = useDispatch();
  const { handleCartAction } = useCartActions();

  const { list = [], isLoading } = useSelector((state) => state.recommend);

  useEffect(() => {
    dispatch(fetchRecommendations());
  }, [dispatch]);

  // FILTER VALID PRODUCTS
  const products = useMemo(() => {
    return (list || []).filter((p) => p && p._id && p.stock > 0);
  }, [list]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      // Tính toán khoảng cách cuộn chuẩn theo kích thước thẻ thực tế
      const cardWidth = window.innerWidth < 768 ? 256 : 306; 
      const amount = direction === "left" ? -cardWidth : cardWidth;

      scrollRef.current.scrollBy({
        left: amount,
        behavior: "smooth",
      });
    }
  };

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="relative py-10 md:py-20 bg-white dark:bg-[#020202] overflow-hidden transition-colors duration-1000">
      <FloatingDecor />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
        {/* HEADER */}
        <div className="flex flex-col items-center mb-8 md:mb-16 text-center space-y-4">
          <div className="flex flex-col items-center">
            <div className="relative mb-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute -inset-1.5 border border-dashed border-[#77cd3a]/30 rounded-full pointer-events-none"
              />
              <img
                src="/logohaha.png"
                alt="logo"
                className="w-8 h-8 md:w-10 md:h-10 object-contain relative z-10"
              />
            </div>
            <span className="text-[9px] font-bold tracking-[0.5em] text-[#77cd3a] uppercase select-none">
              Personalized Picks
            </span>
          </div>

          <div className="relative max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-5xl font-extralight tracking-tight text-gray-950 dark:text-white leading-tight">
              <span className="flex items-center justify-center gap-3 font-serif italic text-neutral-400 dark:text-neutral-500 select-none">
                <span className="h-[1px] w-6 md:w-12 bg-neutral-200 dark:bg-white/10" />
                Just for you
                <span className="h-[1px] w-6 md:w-12 bg-neutral-200 dark:bg-white/10" />
              </span>
            </h3>
          </div>
        </div>

        {/* SLIDER CONTAINER */}
        <div className="relative group/slider">
          
          {/* LEFT BUTTON (Desktop only) */}
          <div className="absolute top-[40%] -left-4 z-20 hidden md:block opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => scroll("left")}
              className="p-3 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-neutral-600 dark:text-neutral-300 hover:text-[#77cd3a] shadow-md border border-neutral-100 dark:border-white/5 transition-all"
              aria-label="Scroll Left"
            >
              <ChevronLeft size={22} strokeWidth={2} />
            </button>
          </div>

          {/* RIGHT BUTTON (Desktop only) */}
          <div className="absolute top-[40%] -right-4 z-20 hidden md:block opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => scroll("right")}
              className="p-3 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-neutral-600 dark:text-neutral-300 hover:text-[#77cd3a] shadow-md border border-neutral-100 dark:border-white/5 transition-all"
              aria-label="Scroll Right"
            >
              <ChevronRight size={22} strokeWidth={2} />
            </button>
          </div>

          {/* PRODUCTS SLIDER - ĐÃ TỐI ƯU SIÊU MƯỢT */}
          <div
            ref={scrollRef}
            className="mobile-slider flex gap-4 md:gap-[30px] overflow-x-auto pb-6 px-1"
          >
            {products.map((product) => (
              <div
                key={product._id}
                className="mobile-card flex-shrink-0 group/card"
              >
                <div className="relative flex flex-col h-[340px] md:h-[370px]">
                  
                  {/* CARD CONTAINER */}
                  <div className="relative flex-grow rounded-[2rem] bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-100 dark:border-white/5 overflow-hidden transition-all duration-300 group-hover/card:bg-white dark:group-hover/card:bg-neutral-800/40 group-hover/card:shadow-xl group-hover/card:shadow-black/[0.02]">
                    
                    {/* RATING BADGE */}
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-white/95 dark:bg-neutral-900/95 px-2 py-1 rounded-full border border-neutral-100 dark:border-white/5 backdrop-blur-sm select-none">
                      <Star size={10} fill="#77cd3a" className="text-[#77cd3a]" />
                      <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-300">
                        {product.ratings?.toFixed(1) || "0.0"}
                      </span>
                    </div>

                    {/* PRODUCT IMAGE LINK */}
                    <Link
                      to={`/product/${product._id}`}
                      className="absolute inset-0 p-6 flex items-center justify-center"
                    >
                      <div className="w-full h-full flex items-center justify-center rounded-2xl bg-neutral-100/30 dark:bg-neutral-900/40 overflow-hidden relative">
                        <img
                          src={product.images?.[0]?.url || product.image || "/placeholder.png"}
                          alt={product.name}
                          className="w-[80%] h-[80%] object-contain transition-transform duration-500 ease-out md:group-hover/card:scale-105"
                          loading="lazy"
                        />
                      </div>
                    </Link>

                    {/* QUICK ADD TO CART */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleCartAction(product, "ADD", 1);
                      }}
                      className="absolute bottom-4 right-4 w-9 h-9 md:w-10 md:h-10 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-md md:translate-y-2 md:opacity-0 md:group-hover/card:translate-y-0 md:group-hover/card:opacity-100 transition-all duration-300 hover:!bg-[#77cd3a] hover:!text-white z-20"
                      aria-label="Add to cart"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* INFO AREA */}
                  <div className="mt-3 flex flex-col items-center text-center px-1">
                    <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-0.5 truncate w-full group-hover/card:text-[#77cd3a] transition-colors duration-200">
                      {product.name}
                    </h4>

                    <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-[#77cd3a] mb-1 font-medium select-none">
                      <Leaf size={9} />
                      <span className="truncate max-w-[16px] sm:max-w-[160px]">
                        {product.reason || "For you"}
                      </span>
                    </div>

                    <span className="text-xs md:text-sm font-bold text-neutral-500 dark:text-neutral-400">
                      ${Number(product.price || 0).toFixed(2)}
                    </span>
                  </div>

                </div>
              </div>
            ))}

            {/* SHOW ALL BLOCK */}
            <div className="flex-shrink-0 w-[120px] flex items-center justify-center snap-start pl-2">
              <Link to="/products" className="group/all flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center group-hover/all:border-[#77cd3a] transition-colors">
                  <ArrowRight size={16} className="text-neutral-400 group-hover/all:text-[#77cd3a] transition-transform group-hover/all:translate-x-0.5" />
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-400 group-hover/all:text-[#77cd3a] select-none">
                  Show All
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .mobile-slider {
          scroll-opacity: 0.9;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch; 
          touch-action: pan-x; 
        }
        
        .mobile-slider::-webkit-scrollbar {
          display: none; 
        }
        
        .mobile-slider {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .mobile-card {
          scroll-snap-align: start;
          width: 240px;
          will-change: transform;
          transform: translateZ(0); 
        }

        @media (min-width: 768px) {
          .mobile-card {
            width: 276px; 
          }
        }
      `}</style>
    </section>
  );
};

export default RecommendSlider;