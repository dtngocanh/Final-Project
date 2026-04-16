import React, { useState, useEffect, useMemo } from "react";
import { Star, Send, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  postReview,
  updateReview,
  fetchAllShopReviews,
  clearReviewState,
} from "../../store/slices/productSlice";

const ReviewsContainer = () => {
  const { id: productId } = useParams();
  const dispatch = useDispatch();

  const { authUser } = useSelector((state) => state.auth);
  const { allShopReviews, isSuccess, reviewLoading, isUpdating } = useSelector(
    (state) => state.product,
  );
  const { myOrders } = useSelector((state) => state.order);

  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    dispatch(fetchAllShopReviews());
  }, [dispatch]);

  // 1. Kiểm tra quyền được hiện ô nhập: Đã mua + Đã giao
  const canUserReview = useMemo(() => {
    if (!authUser || !myOrders || myOrders.length === 0) return false;
    return myOrders.some((order) => 
      order.orderStatus === "Delivered" && 
      order.orderItems.some((item) => (item.product._id || item.product).toString() === productId?.toString())
    );
  }, [myOrders, productId, authUser]);

  // 2. Kiểm tra xem đã review chưa để đổi sang mode Update
  const existingReview = useMemo(() => {
    return allShopReviews?.find((rev) => 
      rev.user?._id?.toString() === authUser?._id?.toString() &&
      (rev.product?._id || rev.product)?.toString() === productId?.toString()
    );
  }, [allShopReviews, authUser, productId]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(existingReview ? "Review updated!" : "Review submitted!");
      setComment("");
      dispatch(clearReviewState());
      dispatch(fetchAllShopReviews());
    }
  }, [isSuccess, dispatch, existingReview]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (!comment.trim()) return toast.warn("Please write something first!");
    const myForm = { rating, comment, productId };
    if (existingReview) {
      dispatch(updateReview(myForm));
    } else {
      dispatch(postReview(myForm));
    }
  };

  const updateHandler = () => {
    if (existingReview) {
      setComment(existingReview.comment);
      setRating(existingReview.rating);
      window.scrollTo({ top: 400, behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-32 border-t border-gray-100 dark:border-white/5 pt-24 pb-20 px-4">
      {/* Tiêu đề này LUÔN HIỆN */}
      <h2 className="text-3xl font-light uppercase tracking-[0.2em] mb-16 text-center dark:text-white">
        Community <span className="font-serif italic lowercase text-gray-400">vibes</span>
      </h2>

      {/* --- PHẦN Ô NHẬP: CHỈ hiện khi đã mua hàng thành công --- */}
      <AnimatePresence>
        {canUserReview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 dark:bg-white/[0.02] rounded-[2rem] p-8 mb-20 border border-transparent dark:border-white/5 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[#77cd3a]/20 flex items-center justify-center text-[#77cd3a]">
                <User size={24} />
              </div>
              <div>
                <h4 className="font-medium dark:text-white text-sm tracking-tight">
                  {existingReview ? "Edit your experience" : "Share your experience"}
                </h4>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(s)}>
                      <Star size={16} fill={(hoverRating || rating) >= s ? "#77cd3a" : "none"} className={`transition-all duration-300 ${(hoverRating || rating) >= s ? "text-[#77cd3a] scale-110" : "text-gray-300"}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <form onSubmit={submitHandler}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-white dark:bg-black/20 rounded-2xl p-6 outline-none border border-gray-100 dark:border-white/5 focus:border-[#77cd3a]/50 transition-all dark:text-white min-h-[120px] font-light"
                placeholder="How do you feel about this product?"
              />
              <div className="flex justify-end mt-4">
                <button type="submit" disabled={reviewLoading || isUpdating} className="flex items-center gap-2 px-10 py-4 bg-[#77cd3a] text-black font-bold rounded-2xl hover:scale-105 transition-all shadow-lg shadow-[#77cd3a]/20 disabled:opacity-50">
                  {reviewLoading || isUpdating ? "Sending..." : existingReview ? "Update" : "Post Review"}
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- PHẦN DANH SÁCH: LUÔN HIỆN cho tất cả mọi người --- */}
      <div className="space-y-12">
        <AnimatePresence mode="popLayout">
          {allShopReviews && allShopReviews.filter(rev => (rev.product?._id || rev.product)?.toString() === productId?.toString()).length > 0 ? (
            allShopReviews
              .filter(rev => (rev.product?._id || rev.product)?.toString() === productId?.toString())
              .map((rev, idx) => (
                <motion.div key={rev._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative pl-8 border-l border-gray-100 dark:border-white/5 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <img src={`https://ui-avatars.com/api/?name=${rev.user?.name}&background=77cd3a&color=fff&rounded=true`} className="w-10 h-10 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500 shadow-sm" alt="avatar" />
                      <div>
                        <h5 className="text-sm font-bold dark:text-white tracking-tight">{rev.user?.name}</h5>
                        {rev.user?._id === authUser?._id && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[#77cd3a] font-bold uppercase">Your Review</span>
                            <button onClick={updateHandler} className="text-[10px] text-gray-400 underline uppercase hover:text-[#77cd3a]">Edit</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-0.5 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-lg">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} fill={i < rev.rating ? "#77cd3a" : "none"} className={i < rev.rating ? "text-[#77cd3a]" : "text-gray-200"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-light leading-relaxed pl-2 italic">
                    "{rev.comment}"
                  </p>
                </motion.div>
              ))
          ) : (
            <p className="text-center text-gray-400 font-light italic">No reviews for this product yet.</p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReviewsContainer;