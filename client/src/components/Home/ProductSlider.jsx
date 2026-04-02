import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "../../store/slices/productSlice";

import { ChevronLeft, ChevronRight, Star, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Link } from "react-router-dom"; // Import Link để điều hướng
import { useCartActions } from "../../hooks/useCartActions";

const ProductSlider = ({ title = "Seasonal Picks" }) => {

  const scrollRef = useRef(null);
  const dispatch = useDispatch();

  // Redux state
  const { products, loading } = useSelector((state) => state.product);

  const {handleCartAction} = useCartActions();

  // Load products từ backend
  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);
  
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) return <p className="text-center py-20 text-gray-400 animate-pulse">Loading nature's best...</p>;
  if (!products || products.length === 0) return <p className="text-center py-20 text-gray-400">No products found</p>;

  return (
    <section className="py-24 bg-white dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 relative">

        {/* Header Section */}
        <div className="flex items-end justify-between mb-12 border-b border-gray-100 dark:border-white/5 pb-8">
          <div>
            <p className="text-[#77cd3a] text-[10px] font-bold uppercase tracking-[0.4em] mb-2">
              Selected by Nature
            </p>
            <h2 className="text-3xl font-light tracking-tight text-gray-900 dark:text-white uppercase">
              {title} <span className="font-serif italic lowercase text-gray-400">series</span>
            </h2>
          </div>

          <div className="flex gap-2">
            <button onClick={() => scroll("left")} className="p-2 text-gray-400 hover:text-[#77cd3a] transition-colors">
              <ChevronLeft size={24} strokeWidth={1} />
            </button>
            <button onClick={() => scroll("right")} className="p-2 text-gray-400 hover:text-[#77cd3a] transition-colors">
              <ChevronRight size={24} strokeWidth={1} />
            </button>
          </div>
        </div>

        {/* Slider Area */}
        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-10"
        >
          {products.map((product, idx) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="min-w-[280px] md:min-w-[320px] snap-start group relative"
            >
              {/* Card Link - Chuyển đến trang chi tiết */}
              <Link to={`/product/${product._id}`} className="block">
                <div className="relative overflow-hidden bg-[#fbfbfb] dark:bg-[#111111] rounded-3xl transition-all duration-500 border border-transparent hover:border-[#77cd3a]/20">

                  {/* Product Image Area */}
                  <div className="relative aspect-square flex items-center justify-center p-10">
                    <motion.img
                      src={product.images?.[0]?.url || "/placeholder.png"}
                      alt={product.name}
                      className="w-[80%] h-[80%] object-contain filter drop-shadow-xl transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3"
                    />

                    {/* Rating Tag */}
                    <div className="absolute top-6 left-6 flex items-center gap-1.5 bg-white/60 dark:bg-black/30 backdrop-blur-md px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <Star size={14} className="fill-[#77cd3a] text-[#77cd3a]" />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                        {product.ratings}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleCartAction(product, "ADD", 1) }
                      className="absolute bottom-6 right-6 w-12 h-12 bg-[#77cd3a] text-white rounded-2xl flex items-center justify-center 
                                 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 
                                 shadow-lg shadow-[#77cd3a]/30 active:scale-90 z-10"
                    >
                      <ShoppingCart size={20} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Information Area */}
                  <div className="px-8 pb-8">
                    <h3 className="text-xl font-extralight text-gray-800 dark:text-gray-100 group-hover:text-[#77cd3a] transition-colors tracking-tight">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xl font-light text-gray-700 dark:text-white">
                        ${product.price?.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-gray-400 font-serif italic tracking-widest uppercase">
                        per kg
                      </span>
                    </div>
                  </div>

                  {/* Subtle Hover Border Overlay */}
                  <div className="absolute inset-0 border border-transparent group-hover:border-[#77cd3a]/10 rounded-3xl pointer-events-none transition-colors duration-500" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default ProductSlider;