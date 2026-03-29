import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import { fetchAllProducts } from "../../store/slices/productSlice";

import { ChevronLeft, ChevronRight, Star, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { addToCartAndSync, syncCartToDB } from "../../store/thunks/cartThunks";



const ProductSlider = ({ title = "Seasonal Picks" }) => {
  const scrollRef = useRef(null);
  const dispatch = useDispatch();

  // Redux state
  const { products, loading } = useSelector((state) => state.product);

  // Load products
  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  // Add to cart
  const handleAddToCart = (product) => {
    dispatch(addToCartAndSync({
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          images: product.images,
        },
        quantity: 1,
      }));

    toast.success(
      <div className="flex items-center gap-3">
        <img src="/logohaha.png" alt="" />
        <div>
          <p className="text-sm">Yum! Added!</p>
          <p className="text-sm font-serif italic">
            {product.name} is in your cart
          </p>
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: 2000,
        icon: false,
        className:
          "border-l-4 border-[#77cd3a] rounded-xl shadow-2xl dark:bg-[#1a1a1a] dark:text-white bg-white text-gray-800",
        progressClassName: "bg-[#77cd3a]",
      }
    );
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -400 : 400,
        behavior: "smooth",
      });
    }
  };

  // Loading
  if (loading) {
    return (
      <p className="text-center py-10 text-gray-400">
        Loading products...
      </p>
    );
  }

  // Không có sản phẩm
  if (!products || products.length === 0) {
    return (
      <p className="text-center py-10 text-gray-400">
        No products found
      </p>
    );
  }

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
              className="p-2 text-gray-400 hover:text-[#77cd3a]"
            >
              <ChevronLeft size={20} strokeWidth={1} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 text-gray-400 hover:text-[#77cd3a]"
            >
              <ChevronRight size={20} strokeWidth={1} />
            </button>
          </div>
        </div>

        {/* Slider */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-10"
        >
          {products.map((product, idx) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="min-w-[280px] md:min-w-[320px] snap-start group"
            >
              <div className="relative overflow-hidden bg-[#fbfbfb] dark:bg-[#111111] rounded-2xl">

                {/* Image */}
                <div className="relative aspect-square flex items-center justify-center p-8">
                  <motion.img
                    src={product.images?.[0]?.url}
                    alt={product.name}
                    className="w-[80%] h-[80%] object-contain transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-2"
                  />

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="absolute bottom-4 right-4 w-10 h-10 bg-white dark:bg-[#77cd3a] rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <ShoppingCart size={16} />
                  </button>

                  <div className="absolute top-4 left-4 flex items-center gap-1">
                    <Star size={15} className="text-[#77cd3a]" />
                    <span className="text-sm text-gray-400">
                      {product.ratings || 0}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="px-6 pb-6 pt-2">
                  <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 group-hover:text-[#77cd3a]">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      ${product.price?.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-400 italic">
                      per kg
                    </span>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>
        {`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { scrollbar-width: none; }
        `}
      </style>
    </section>
  );
};

export default ProductSlider;