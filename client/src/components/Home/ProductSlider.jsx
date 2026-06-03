import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "../../store/slices/productSlice";
import { ChevronLeft, ChevronRight, Star, Plus } from "lucide-react";
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
      // Chiều rộng dịch chuyển tối ưu tương thích theo kích thước cột của thiết bị
      const cardWidth = window.innerWidth < 768 ? 190 : 284;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -cardWidth : cardWidth,
        behavior: "smooth",
      });
    }
  };

  // Nhóm mảng sản phẩm gốc thành từng cặp 2 item để xếp thành 2 hàng dọc
  const chunkedProducts = React.useMemo(() => {
    if (!products) return [];
    const chunks = [];
    for (let i = 0; i < products.length; i += 2) {
      chunks.push(products.slice(i, i + 2));
    }
    return chunks;
  }, [products]);

  if (loading) return <FruitLoader />;
  if (chunkedProducts.length === 0) return null;

  return (
    <section className="py-12 md:py-20 bg-white dark:bg-[#030303] overflow-hidden transition-colors duration-500 relative">
      <FloatingDecor />

      <div className="max-w-[1450px] mx-auto px-4 sm:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 md:mb-12 border-b border-neutral-100 dark:border-white/5 pb-4 md:pb-6">
          <h2 className="text-xl md:text-3xl font-extralight tracking-tight text-gray-950 dark:text-white uppercase leading-none">
            {title} <span className="font-serif italic lowercase text-neutral-400">series</span>
          </h2>
          <div className="hidden sm:flex gap-2">
            <button onClick={() => scroll("left")} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors">
              <ChevronLeft size={24} strokeWidth={1.5} className="text-neutral-500" />
            </button>
            <button onClick={() => scroll("right")} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors">
              <ChevronRight size={24} strokeWidth={1.5} className="text-neutral-500" />
            </button>
          </div>
        </div>

        {/* Slider Area - Đóng vai trò thanh cuộn ngang chính */}
        <div 
          ref={scrollRef} 
          className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6 px-1"
        >
          {chunkedProducts.map((pair, pairIdx) => (
            <div 
              key={pairIdx} 
              className="flex flex-col gap-4 md:gap-6 min-w-[170px] sm:min-w-[240px] md:min-w-[260px] max-w-[180px] sm:max-w-none snap-start"
            >
              {pair.map((product, idx) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (pairIdx * 2 + idx) * 0.03, duration: 0.4 }}
                  className="group relative w-full"
                >
                  {/* Thẻ Card nội dung */}
                  <div className="relative flex flex-col bg-[#f9f9f9] dark:bg-[#111] rounded-2xl sm:rounded-[2rem] overflow-hidden border border-neutral-100/80 dark:border-white/5 shadow-sm md:hover:shadow-xl md:hover:shadow-black/5 transition-all duration-500 transform-gpu">
                    
                    {/* Container Ảnh */}
                    <Link to={`/product/${product._id}`} className="block relative w-full aspect-square overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center p-3 sm:p-4">
                        <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl border border-neutral-100 dark:border-white/5 bg-neutral-50 dark:bg-neutral-900/50 shadow-inner">
                          <img
                            src={product.images?.[0]?.url || "/placeholder.png"}
                            alt={product.name}
                            className="w-[85%] h-[85%] object-contain md:group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                          />
                        </div>
                      </div>
                      
                      {/* Rating Tag */}
                      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-0.5 sm:gap-1 bg-white/80 dark:bg-black/60 px-1.5 py-0.5 rounded-full backdrop-blur-[2px] border border-neutral-100 dark:border-white/5">
                        <Star size={9} fill="#77cd3a" className="text-[#77cd3a]" />
                        <span className="text-[9px] font-black text-neutral-600 dark:text-neutral-300">{product.ratings?.toFixed(1)}</span>
                      </div>
                    </Link>

                    {/* Thanh phân cách */}
                    <div className="mx-4 sm:mx-8 h-[1px] bg-neutral-100 dark:bg-white/5" />

                    {/* Thông tin sản phẩm */}
                    <div className="px-3 py-4 sm:px-6 sm:py-6 text-center">
                      <h3 className="text-xs sm:text-base font-medium text-neutral-800 dark:text-neutral-100 mb-1 sm:mb-1.5 truncate md:group-hover:text-[#77cd3a] transition-colors leading-tight">
                        {product.name}
                      </h3>
                      <div className="flex flex-col xs:flex-row items-center justify-center gap-0.5 xs:gap-1">
                        <span className="text-xs sm:text-sm md:text-[14px] font-bold text-neutral-900 dark:text-white">
                          ${product.price?.toFixed(2)}
                        </span>
                        <span className="text-[8px] sm:text-[9px] text-neutral-400 font-medium uppercase tracking-tight">
                          / kg
                        </span>
                      </div>
                    </div>

                    {/* Nút giỏ hàng tương tác nhanh */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCartAction(product, "ADD", 1);
                      }}
                      className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 md:bottom-[85px] md:right-6 w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-neutral-950 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-md active:scale-90 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-500 md:hover:bg-[#77cd3a] md:hover:text-white z-30"
                      aria-label="Add to cart"
                    >
                      <Plus size={16} sm={20} md={22} strokeWidth={2} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
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