import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "../../store/slices/productSlice";
import { ChevronLeft, ChevronRight, Star, Plus, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCartActions } from "../../hooks/useCartActions";
import FloatingDecor from "../Fruit/FloatingDecor";
import FruitLoader from "../Fruit/FruitLoader";

const ProductSlider = ({ title = "Seasonal Picks" }) => {
  const scrollRef = useRef(null);
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.product);
  const { handleCartAction } = useCartActions();

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) return <FruitLoader/>
  if (!products || products.length === 0) return null;

  return (
    <section className="py-20 bg-white dark:bg-[#030303] overflow-hidden transition-colors duration-500 relative">
      {/* 1. Thêm Logic Floating Decor ở đây */}
      <FloatingDecor />

      <div className="max-w-[1450px] mx-auto px-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12 border-b border-neutral-100 dark:border-white/5 pb-6">
          <h2 className="text-2xl md:text-3xl font-extralight tracking-tight text-gray-950 dark:text-white uppercase leading-none">
            {title} <span className="font-serif italic lowercase text-neutral-400">series</span>
          </h2>
          <div className="flex gap-2">
            <button onClick={() => scroll("left")} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors">
              <ChevronLeft size={24} strokeWidth={1.5} className="text-neutral-500" />
            </button>
            <button onClick={() => scroll("right")} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors">
              <ChevronRight size={24} strokeWidth={1.5} className="text-neutral-500" />
            </button>
          </div>
        </div>

        {/* Slider Area */}
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-10 px-2">
          {products.map((product, idx) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="min-w-[240px] md:min-w-[260px] snap-start group"
            >
              {/* Thẻ Card - Sửa bg-white thành bg-[#f9f9f9] cho xám xíu xiu ở light mode */}
              <div className="relative flex flex-col bg-[#f9f9f9] dark:bg-[#111] rounded-[2rem] overflow-hidden border border-neutral-100 dark:border-white/5 shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all duration-500">
                
                {/* Container Ảnh Vuông 1:1 */}
                <Link to={`/product/${product._id}`} className="block relative w-full aspect-square overflow-hidden group">
                  <div className="w-full h-full flex items-center justify-center">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="w-[80%] h-[80%] flex items-center justify-center overflow-hidden rounded-2xl border border-neutral-100 dark:border-white/5 bg-neutral-50 dark:bg-neutral-900 shadow-inner"
                    >
                      <img
                        src={product.images?.[0]?.url || "/placeholder.png"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  </div>
                  
                  {/* Rating Tag */}
                  <div className="absolute top-6 left-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
                    <Star size={10} fill="#77cd3a" className="text-[#77cd3a]" />
                    <span className="text-[10px] font-bold text-neutral-400">{product.ratings?.toFixed(1)}</span>
                  </div>
                </Link>

                {/* Đường kẻ nhạt giữa ảnh và chữ */}
                <div className="mx-8 h-[1px] bg-neutral-100 dark:bg-white/5" />

                {/* Thông tin sản phẩm */}
                <div className="px-6 py-6 text-center">
                  <h3 className="text-medium font-medium text-neutral-800 dark:text-neutral-100 mb-1.5 truncate group-hover:text-[#77cd3a] transition-colors leading-tight">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-[14px] font-semibold text-neutral-900 dark:text-white">
                      ${product.price?.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-neutral-300 font-bold uppercase tracking-tight pt-0.5">
                      / per kg
                    </span>
                  </div>
                </div>

                {/* Nút giỏ hàng trượt lên */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleCartAction(product, "ADD", 1);
                  }}
                  className="absolute bottom-[90px] right-6 w-11 h-11 bg-neutral-950 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-2xl opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-[#77cd3a] hover:text-white z-20"
                >
                  <Plus size={22} strokeWidth={1.5} />
                </button>
              </div>
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