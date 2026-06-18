import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Star, Tag } from "lucide-react"; // Thêm icon Tag cho ưu đãi
import { fetchRecommendations } from "../../store/slices/recommendSlice.js";
import { addToCartThunk } from "../../store/slices/cartSlice.js";
import { toast } from "react-toastify";

const RecommendSuccess = () => {
  const dispatch = useDispatch();
  const { list: recommendedList, isLoading } = useSelector(
    (state) => state.recommend,
  );

  useEffect(() => {
    dispatch(fetchRecommendations());
  }, [dispatch]);

  const onAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCartThunk({ productId: product._id, quantity: 1 }))
      .unwrap()
      .then((response) => {
        toast.success(`Added ${product.name} to cart!`, {
          position: "bottom-right",
          autoClose: 2000,
          toastId: `add-success-${product._id}`, 
        });
      })
      .catch((error) => {
        toast.error(error || "Failed to add product to cart!");
      });
  };

  // Thay vì return null, hãy kiểm tra list ở dưới để tránh lỗi giao diện
  if (!isLoading && recommendedList.length === 0) return null;

  return (
    <section className="py-8 bg-transparent w-full">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header với thông điệp ưu đãi 10% */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse flex items-center gap-1">
              <Tag size={10} /> 10% OFF
            </div>
            <h2 className="text-xl font-bold tracking-tight dark:text-white">
              Special{" "}
              <span className="font-serif italic text-[#77cd3a]">Deals</span>{" "}
              for you
            </h2>
          </div>
          <Link
            to="/"
            className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 hover:text-[#77cd3a]"
          >
            View All
          </Link>
        </header>

        {/* Danh sách sản phẩm */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
          {isLoading
            ? // Hiển thị loading đơn giản nếu đang fetch
              [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="min-w-[200px] h-[250px] bg-gray-100 animate-pulse rounded-2xl"
                />
              ))
            : recommendedList.slice(0, 8).map((product, idx) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="min-w-[200px] w-[200px] group bg-white dark:bg-[#0a0a0a] rounded-2xl p-3 border border-neutral-100 hover:border-[#77cd3a] transition-all"
                >
                  <Link to={`/product/${product._id}`}>
                    <div className="relative aspect-square bg-[#f9f9f9] rounded-xl overflow-hidden mb-3 flex items-center justify-center p-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                      />

                      {/* Badge giảm giá trên từng ảnh sản phẩm */}
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md">
                        -10%
                      </div>

                      <button
                        onClick={(e) => onAddToCart(e, product)}
                        className="absolute bottom-2 right-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-[#77cd3a] transition-colors shadow-lg"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-neutral-800 line-clamp-1">
                        {product.name}
                      </h4>
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-[#77cd3a]">
                            ${(product.price * 0.9).toFixed(2)}{" "}
                            {/* Giá đã giảm 10% */}
                          </span>
                          <span className="text-[10px] text-neutral-400 line-through">
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-md">
                          <Star
                            size={8}
                            fill="#77cd3a"
                            className="text-[#77cd3a]"
                          />
                          <span className="text-[9px] font-bold text-neutral-600">
                            4.9
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
};
export default RecommendSuccess;
