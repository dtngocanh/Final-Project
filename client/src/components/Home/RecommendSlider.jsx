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
import { getRecommendationsThunk } from "../../store/slices/interactionSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchRecommendations } from "../../store/slices/recommendSlice.js";

const RecommendSlider = () => {
  const scrollRef = useRef(null);
  const dispatch = useDispatch();

  const { handleCartAction } = useCartActions();

  const { list = [], isLoading } = useSelector(
    (state) => state.recommend
  );

  useEffect(() => {
    dispatch(fetchRecommendations());
  }, [dispatch]);

  // FILTER VALID PRODUCTS
  const products = useMemo(() => {
    return (list || []).filter(
      (p) =>
        p &&
        p._id &&
        p.stock > 0
    );
  }, [list]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -280 : 280;

      scrollRef.current.scrollBy({
        left: amount,
        behavior: "smooth",
      });
    }
  };

  // HIDE SECTION IF NO DATA
  if (!isLoading && products.length === 0) return null;

  return (
    <section className="relative py-20 bg-white dark:bg-[#020202] overflow-hidden transition-colors duration-1000">
      <FloatingDecor />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        {/* HEADER */}
        <div className="flex flex-col items-center mb-16 text-center space-y-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute -inset-2 border border-dashed border-[#77cd3a]/30 rounded-full"
              />

              <img
                src="/logohaha.png"
                alt="logo"
                className="w-10 h-10 object-contain relative z-10"
              />
            </div>

            <span className="text-[9px] font-bold tracking-[0.6em] text-[#77cd3a] uppercase">
              Personalized Picks
            </span>
          </motion.div>

          {/* TITLE */}
          <div className="relative max-w-2xl mx-auto">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-3xl md:text-6xl font-extralight tracking-tight text-gray-950 dark:text-white leading-[1.1]"
            >
              <span className="flex items-center justify-center gap-4 font-serif italic text-neutral-400 dark:text-neutral-500">
                <span className="h-[1px] w-8 md:w-12 bg-neutral-200 dark:bg-white/10" />
                Just for you
                <span className="h-[1px] w-8 md:w-12 bg-neutral-200 dark:bg-white/10" />
              </span>
            </motion.h3>

            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -right-4 bottom-2 w-2 h-2 bg-[#77cd3a] rounded-full hidden md:block"
            />
          </div>

          {/* LINE */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: "40px", opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="h-[2px] bg-[#77cd3a]/50 rounded-full"
          />
        </div>

        {/* SLIDER */}
        <div className="relative group/slider">
          {/* LEFT BUTTON */}
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 z-20 hidden md:block opacity-0 group-hover/slider:opacity-100 transition-opacity">
            <button
              onClick={() => scroll("left")}
              className="p-2 text-neutral-300 hover:text-[#77cd3a] transition-all"
            >
              <ChevronLeft size={30} strokeWidth={1} />
            </button>
          </div>

          {/* RIGHT BUTTON */}
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 z-20 hidden md:block opacity-0 group-hover/slider:opacity-100 transition-opacity">
            <button
              onClick={() => scroll("right")}
              className="p-2 text-neutral-300 hover:text-[#77cd3a] transition-all"
            >
              <ChevronRight size={30} strokeWidth={1} />
            </button>
          </div>

          {/* PRODUCTS */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-10 px-2"
          >
            {products.map((product, idx) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.08,
                }}
                className="min-w-[200px] md:min-w-[230px] snap-start group"
              >
                <div className="relative flex flex-col h-[380px]">
                  {/* CARD */}
                  <div className="relative flex-grow rounded-[2rem] bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-100 dark:border-white/5 overflow-hidden transition-all duration-500 group-hover:bg-white dark:group-hover:bg-neutral-800 group-hover:shadow-xl group-hover:shadow-black/5">
                    {/* RATING */}
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-white/90 dark:bg-black/60 px-2 py-1 rounded-full backdrop-blur-sm">
                      <Star
                        size={10}
                        fill="#77cd3a"
                        className="text-[#77cd3a]"
                      />

                      <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-300">
                        {product.ratings?.toFixed(1) || "0.0"}
                      </span>
                    </div>

                    {/* IMAGE */}
                    <Link
                      to={`/product/${product._id}`}
                      className="absolute inset-0 flex items-center justify-center overflow-hidden"
                    >
                      <motion.div
                        whileHover={{ scale: 1.08 }}
                        transition={{
                          duration: 0.8,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="w-[80%] h-[80%] flex items-center justify-center overflow-hidden rounded-2xl border border-neutral-100 dark:border-white/5 bg-neutral-100/50 dark:bg-neutral-900 shadow-inner"
                      >
                        <img
                          src={
                            product.images?.[0]?.url ||
                            product.image ||
                            "/placeholder.png"
                          }
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    </Link>

                    {/* ADD TO CART */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleCartAction(product, "ADD", 1);
                      }}
                      className="absolute bottom-4 right-4 w-10 h-10 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-lg translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 hover:bg-[#77cd3a] hover:text-white z-20"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  {/* INFO */}
                  <div className="mt-5 flex flex-col items-center text-center px-1">
                    <h4 className="text-md font-medium text-neutral-800 dark:text-neutral-200 mb-1 truncate w-full group-hover:text-[#77cd3a] transition-colors">
                      {product.name}
                    </h4>

                    {/* REASON */}
                    <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-[#77cd3a] mb-2">
                      <Leaf size={9} />
                      <span>
                        {product.reason || "Recommended for you"}
                      </span>
                    </div>

                    {/* PRICE */}
                    <span className="text-sm font-bold text-neutral-400 tracking-tighter">
                      $
                      {Number(product.price || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* SHOW ALL */}
            <div className="min-w-[120px] flex items-center justify-center snap-start">
              <Link
                to="/products"
                className="group flex flex-col items-center gap-2"
              >
                <div className="w-10 h-10 rounded-full border border-dashed border-neutral-200 dark:border-neutral-800 flex items-center justify-center group-hover:border-[#77cd3a] transition-all">
                  <ArrowRight
                    size={16}
                    className="text-neutral-300 group-hover:text-[#77cd3a]"
                  />
                </div>

                <span className="text-[7px] font-bold uppercase tracking-widest text-neutral-400">
                  Show All
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default RecommendSlider;
