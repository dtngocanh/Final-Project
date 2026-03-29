import React from "react";
import { Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { addToCartAndSync } from "../../store/thunks/cartThunks";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = (e) => {
    // Ngăn chặn sự kiện click lan ra thẻ Link bao ngoài
    e.preventDefault();
    e.stopPropagation();

    dispatch(
      addToCartAndSync({
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          images: product.images,
        },
        quantity: 1,
      })
    );

    // Toast cute đồng bộ với Slider
    toast.success(
      <div className="flex items-center gap-3">
        <img src="/logohaha.png" alt="" className="w-8 h-8 object-contain" />
        <div>
          <p className="text-sm font-medium">Yum! Added!</p>
          <p className="text-xs font-serif italic opacity-80">
            {product.name} is in your cart
          </p>
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: 2000,
        icon: false,
        className: "border-l-4 border-[#77cd3a] rounded-xl shadow-2xl dark:bg-[#1a1a1a] dark:text-white bg-white text-gray-800",
        progressClassName: "bg-[#77cd3a]",
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <Link to={`/product/${product._id}`}>
        <div className="relative overflow-hidden bg-[#fbfbfb] dark:bg-[#111111] rounded-2xl transition-all duration-500 border border-transparent dark:border-white/[0.03]">

          {/* Product Image Area */}
          <div className="relative aspect-square flex items-center justify-center p-8">
            <motion.img
              src={product.images?.[0]?.url}
              alt={product.name}
              className="w-[80%] h-[80%] object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)] transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-2"
            />

            {/* Quick Add Button */}
            <button
              onClick={handleAddToCart}
              className="absolute bottom-4 right-4 w-10 h-10 bg-white dark:bg-[#77cd3a] dark:text-black rounded-xl shadow-md flex items-center justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 active:scale-90 z-10"
            >
              <ShoppingCart size={16} strokeWidth={2} />
            </button>

            {/* Rating Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <Star size={14} fill="#77cd3a" className="text-[#77cd3a]" />
              <span className="text-xs text-gray-400 font-medium tracking-tighter">
                {product.ratings}
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div className="px-6 pb-6 pt-2">
            <div className="mb-1">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 tracking-tight group-hover:text-[#77cd3a] transition-colors truncate">
                {product.name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-light text-gray-900 dark:text-white">
                ${product.price?.toFixed(2)}
              </span>
              <span className="text-[10px] text-gray-400 font-serif italic">
                per unit
              </span>
            </div>
          </div>

          {/* Hover Border Overlay */}
          <div className="absolute inset-0 border border-transparent group-hover:border-[#77cd3a]/20 rounded-2xl pointer-events-none transition-colors duration-500" />
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;