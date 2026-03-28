import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const defaultProducts = [
  { _id: "1", name: "Mango", image: "/mango.png", price: 4.99, ratings: 4.8 },
  {
    _id: "2",
    name: "Broccoli",
    image: "/broli.png",
    price: 12.5,
    ratings: 4.9,
  },
  { _id: "3", name: "Salad", image: "/xalach.png", price: 3.2, ratings: 4.2 },
  { _id: "4", name: "Cherry", image: "/cheri1.png", price: 5.45, ratings: 4.7 },
  { _id: "5", name: "Peach", image: "/peach.png", price: 5.45, ratings: 4.7 },
];

const ProductSlider = ({ title = "Seasonal Picks", products }) => {
  const scrollRef = useRef(null);
  const dispatch = useDispatch(); // Khởi tạo dispatch

  const displayProducts = products?.length > 0 ? products : defaultProducts;

  // Hàm xử lý khi bấm nút thêm vào giỏ hàng
  const handleAddToCart = (product) => {
    dispatch(
      addToCart({
        product: {
          id: product._id, // Map _id từ mock data sang id trong slice
          name: product.name,
          price: product.price,
          image: product.image,
        },
        quantity: 1, // Mặc định mỗi lần bấm là thêm 1
      }),
    );
    toast.success(
      <div className="flex items-center gap-3">
        <img src="/logohaha.png" alt="" />
        <div>
          <p className=" text-sm">Yum! Added!</p>
          <p className="text-sm font-serif italic">{product.name} is in your cart</p>
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        // Theme "colored" kết hợp với icon tùy chỉnh sẽ rất cute
        icon: false,
        className:
          "border-l-4 border-[#77cd3a] rounded-xl shadow-2xl dark:bg-[#1a1a1a] dark:text-white bg-white text-gray-800",
        progressClassName: "bg-[#77cd3a]",
      },
    );
  };
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-24 bg-white dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-12 border-b border-gray-100 dark:border-white/5 pb-8">
          <div>
            <p className="text-[#77cd3a] text-[10px] font-bold uppercase tracking-[0.4em] mb-2">
              Selected by Nature
            </p>
            <h2 className="text-3xl font-light tracking-tight text-gray-900 dark:text-white uppercase">
              {title}{" "}
              <span className="font-serif italic lowercase text-gray-400">
                series
              </span>
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 text-gray-400 hover:text-[#77cd3a] transition-colors"
            >
              <ChevronLeft size={20} strokeWidth={1} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 text-gray-400 hover:text-[#77cd3a] transition-colors"
            >
              <ChevronRight size={20} strokeWidth={1} />
            </button>
          </div>
        </div>

        {/* Slider Area */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-10"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {displayProducts.map((product, idx) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="min-w-[280px] md:min-w-[320px] snap-start group"
            >
              <div className="relative overflow-hidden bg-[#fbfbfb] dark:bg-[#111111] rounded-2xl transition-all duration-500 border border-transparent dark:border-white/[0.03]">
                {/* Product Image */}
                <div className="relative aspect-square flex items-center justify-center p-8">
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)] transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-2"
                  />

                  {/* Nút Cart - Đã gắn handleAddToCart */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="absolute bottom-4 right-4 w-10 h-10 bg-white dark:bg-[#77cd3a] dark:text-black rounded-xl shadow-sm flex items-center justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 active:scale-90 z-10"
                  >
                    <ShoppingCart size={16} strokeWidth={2} />
                  </button>

                  {/* Rating */}
                  <div className="absolute top-4 left-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <Star size={15} fill="#77cd3a" className="text-[#77cd3a]" />
                    <span className="text-sm text-gray-400 font-medium tracking-tighter">
                      {product.ratings}
                    </span>
                  </div>
                </div>

                {/* Info Area */}
                <div className="px-6 pb-6 pt-2">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 tracking-tight group-hover:text-[#77cd3a] transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-light text-gray-900 dark:text-white">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-serif italic">
                      per unit
                    </span>
                  </div>
                </div>

                {/* Subtle Hover Gradient */}
                <div className="absolute inset-0 border border-transparent group-hover:border-[#77cd3a]/20 rounded-2xl pointer-events-none transition-colors duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </section>
  );
};

export default ProductSlider;
