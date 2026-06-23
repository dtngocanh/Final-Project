import React, { useState, useEffect, useMemo } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchAllShopReviews } from "../../store/slices/productSlice";

const ReviewsContainer = () => {
  const { id: productId } = useParams();
  const dispatch = useDispatch();

  const { allShopReviews } = useSelector((state) => state.product);

  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  useEffect(() => {
    dispatch(fetchAllShopReviews());
  }, [dispatch]);

  const productReviews = useMemo(() => {
    return (allShopReviews || []).filter(
      (rev) =>
        (rev.product?._id || rev.product)?.toString() === productId?.toString(),
    );
  }, [allShopReviews, productId]);

  // Phân trang dữ liệu hiển thị
  const totalPages = Math.ceil(productReviews.length / reviewsPerPage);
  
  const currentReviews = useMemo(() => {
    return productReviews.slice(
      (currentPage - 1) * reviewsPerPage,
      currentPage * reviewsPerPage,
    );
  }, [productReviews, currentPage]);

  return (
    <div className="max-w-4xl mx-auto mt-20 md:mt-32 border-t border-gray-100 dark:border-white/10 pt-16 md:pt-24 pb-20 px-4 md:px-6">
      {/* Header tiêu đề khối Feedback */}
      <div className="mb-16 text-center">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#77cd3a] mb-4 block">
          Community Feedback
        </span>
        <h2 className="text-3xl md:text-5xl font-extralight text-gray-950 dark:text-white tracking-tighter">
          What others say
        </h2>
      </div>

      {/* Danh sách hiển thị các bài đánh giá */}
      <div className="space-y-12">
        <AnimatePresence mode="popLayout">
          {currentReviews.length > 0 ? (
            <motion.div key={currentPage} className="space-y-10">
              {currentReviews.map((rev) => (
                <div key={rev._id} className="flex gap-4 md:gap-6 group">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(rev.user?.name || "User")}&background=f3f4f6&color=9ca3af&rounded=true`}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shadow-sm"
                    alt="avatar"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-bold text-gray-950 dark:text-white">
                          {rev.user?.name || "Anonymous User"}
                        </h5>
                        <div className="flex gap-0.5 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              fill={i < rev.rating ? "#77cd3a" : "none"}
                              className={
                                i < rev.rating ? "text-[#77cd3a]" : "text-gray-200 dark:text-stone-800"
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed text-sm">
                      {rev.comment}
                    </p>
                  </div>
                </div>
              ))}

              {/* Thanh điều hướng phân trang UI */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-6 pt-10">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 disabled:opacity-30 rounded-full transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-xs font-bold dark:text-white">
                    Page {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 disabled:opacity-30 rounded-full transition-colors cursor-pointer"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <p className="text-center text-gray-400 font-light italic py-10">
              No reviews yet for this harvest.
            </p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReviewsContainer;