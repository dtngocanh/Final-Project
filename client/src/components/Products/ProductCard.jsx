import React from "react";
import { Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { useCartActions } from "../../hooks/useCartActions";
import { handleProductClick } from "../../store/slices/productSlice";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { handleCartAction } = useCartActions();

  const onClickCard = () => {
    dispatch(handleProductClick({ productId: product._id }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative cursor-pointer"
      onClick={onClickCard}
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

            {/* Rating Badge - Luôn hiện cho đồng bộ */}
            <div className="absolute top-4 left-4 flex items-center gap-1">
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

      {/* --- NÚT GIỎ HÀNG LUÔN HIỆN --- */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handleCartAction(product, "ADD", 1);
        }}
        className="absolute bottom-[88px] right-6 w-12 h-12 bg-[#77cd3a] text-white rounded-2xl flex items-center justify-center 
                   shadow-lg shadow-[#77cd3a]/30 active:scale-90 z-20 transition-all duration-300
                   opacity-100 translate-y-0" // Đã xóa opacity-0 và group-hover
      >
        <ShoppingCart size={16} strokeWidth={2} />
      </button>
    </motion.div>
  );
};

export default ProductCard;