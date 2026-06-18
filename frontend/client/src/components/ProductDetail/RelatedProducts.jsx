import React from "react";
import { motion } from "framer-motion";
import { Plus, ArrowRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCartThunk } from "../../store/slices/cartSlice";
import { toast } from "react-toastify";

const RelatedProducts = ({ products }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Kiểm tra nếu không có dữ liệu thì nghỉ khỏe
  if (!products || products.length === 0) return null;

  // 2. Chỉ lấy 4 món đầu tiên để hiện ra ngoài mặt tiền
  const displayedProducts = products.slice(0, 4);

  return (
    <section className="py-20 bg-white dark:bg-[#020202]">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h3 className="text-2xl md:text-3xl font-extralight tracking-tighter text-gray-950 dark:text-white">
              You might{" "}
              <span className="font-medium text-[#77cd3a]">also like</span>
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-[1px] w-8 bg-[#77cd3a]" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-bold">
                Handpicked for you
              </p>
            </div>
          </div>

          {/* Nút View All này bấm vào sẽ dẫn đi đâu đó để xem hết 6 món hoặc toàn bộ shop */}
          <button
            onClick={() => navigate("/products")}
            className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#77cd3a] transition-colors group"
          >
            View All
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>

        {/* Grid Danh sách - Giờ chỉ còn 4 món */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {displayedProducts.map((item, index) => (
            <motion.div
              key={item._id} // ID được cất ở đây, React biết thôi chứ người dùng không thấy
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                navigate(`/product/${item._id}`);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group relative cursor-pointer"
            >
              <div className="relative bg-[#fafafa] dark:bg-white/[0.02] rounded-[2.5rem] p-4 md:p-6 border border-transparent dark:border-white/[0.03] hover:bg-white dark:hover:bg-neutral-900 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-black/40">
                {/* Image Area */}
                <div className="relative aspect-square mb-6 flex items-center justify-center overflow-hidden">
                  <div className="w-[85%] h-[85%] flex items-center justify-center bg-white dark:bg-neutral-800 rounded-3xl shadow-inner border border-neutral-100 dark:border-white/5">
                    <img
                      src={item.images?.[0]?.url || "/placeholder.png"}
                      alt={item.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>

                  {/* Rating */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/80 dark:bg-black/50 backdrop-blur-md px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Star size={10} fill="#77cd3a" className="text-[#77cd3a]" />
                    <span className="text-[9px] font-bold dark:text-white">
                      {item.ratings?.toFixed(1) || 0}
                    </span>
                  </div>

                  {/* Nút Plus */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(
                        addToCartThunk({ productId: item._id, quantity: 1 }),
                      )
                        .unwrap()
                        .then((response) => {
                          toast.success(`Added ${item.name} to cart!`, {
                            position: "bottom-right",
                            autoClose: 2000,
                            toastId: "add-to-cart-success",
                          });
                        })
                        .catch((error) => {
                          toast.error(
                            error || "Failed to add product to cart!",
                          );
                        });
                    }}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-neutral-950 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-[#77cd3a] dark:hover:bg-[#77cd3a] dark:hover:text-white z-20 shadow-xl active:scale-90"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {/* Info - Tuyệt đối không render ID ra đây nữa */}
                <div className="space-y-1 px-2">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#77cd3a] font-black">
                    {/* {item.category?.name || item.category || "General"} */}
                  </span>
                  <h4 className="text-sm md:text-base font-medium text-gray-900 dark:text-white truncate group-hover:text-[#77cd3a] transition-colors">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-base font-light dark:text-white">
                      ${item.price?.toFixed(2)}
                    </span>
                    <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-tighter pt-1">
                      / unit
                    </span>
                  </div>
                </div>

                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#77cd3a]/10 rounded-[2.5rem] pointer-events-none transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-12 flex justify-center md:hidden">
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] py-4 px-8 border border-neutral-200 dark:border-white/10 rounded-full"
          >
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
