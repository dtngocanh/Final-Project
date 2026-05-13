import React from "react";
import { Star, ShoppingCart, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useCartActions } from "../../hooks/useCartActions";
// import { handleProductClick } from "../../store/slices/productSlice";
import { trackClickThunk } from "../../store/slices/interactionSlice";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { handleCartAction } = useCartActions();
  const { authUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const onClickCard = () => {
    dispatch(
      trackClickThunk({
        productId: product._id,
        action: "view",
      }),
    );

    navigate(`/product/${product._id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative cursor-pointer"
      onClick={onClickCard}
    >
      {/* <Link to={`/product/${product._id}`}> */}
      <div className="relative overflow-hidden bg-[#fbfbfb] dark:bg-[#111111] rounded-2xl transition-all duration-500 border border-transparent dark:border-white/[0.03]">
        {/* Product Image Area */}
        <div className="relative aspect-square flex items-center justify-center p-8">
          <motion.img
            src={product.images?.[0]?.url}
            alt={product.name}
            className="w-full h-full flex items-center justify-center overflow-hidden rounded-2xl border border-neutral-100 dark:border-white/5 bg-neutral-50 dark:bg-neutral-900 shadow-inner"
          />

          {/* Quick Add Button */}
          {product.stock > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleCartAction(product, "ADD", 1);
              }}
              className="absolute bottom-3 right-7 w-11 h-11 bg-neutral-950 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-[#77cd3a] hover:text-white z-20"
            >
              <Plus size={16} strokeWidth={2} />
            </button>
          )}

          {/* Rating Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <Star size={14} fill="#77cd3a" className="text-[#77cd3a]" />
            <span className="text-xs text-gray-400 font-medium tracking-tighter">
              {product.ratings?.toFixed(1)}
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
      {/* </Link> */}
    </motion.div>
  );
};

export default ProductCard;
