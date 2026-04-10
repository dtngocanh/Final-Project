import React, { useState, useEffect } from "react";
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

const INITIAL_REVIEWS = [
  {
    _id: "r1",
    user: { name: "Alex Johnson" },
    rating: 5,
    comment: "The organic mangoes are absolutely divine! Best quality in town.",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "r2",
    user: { name: "Sarah W." },
    rating: 4,
    comment: "Fast delivery and very fresh vegetables. Highly recommended.",
    createdAt: new Date().toISOString(),
  },
];

const ReviewsContainer = () => {
  const { id: productId } = useParams();
  const dispatch = useDispatch();

  const { authUser } = useSelector((state) => state.auth);
  const { allShopReviews, isSuccess, reviewLoading, isUpdating } = useSelector(
    (state) => state.product,
  );

  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  // 1. Chỉ fetch 1 lần duy nhất khi Mount
  useEffect(() => {
    dispatch(fetchAllShopReviews());
  }, [dispatch]);

  // 2. Tìm review cũ
  const existingReview = React.useMemo(() => {
    return allShopReviews?.find((rev) => {
      // Đúng User ID
      const isCorrectUser =
        (rev.userId?._id || rev.userId)?.toString() ===
        authUser?._id?.toString();

      // Đúng Product ID
      const isCorrectProduct =
        rev.productId?.toString() === productId?.toString();

      return isCorrectUser && isCorrectProduct;
    });
  }, [allShopReviews, authUser, productId]);

  useEffect(() => {
    if (isSuccess) {
      dispatch(clearReviewState());
      dispatch(fetchAllShopReviews());
    }
  }, [isSuccess, dispatch]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (!authUser) return toast.error("Please login to post a review");
    if (!comment.trim()) return toast.warn("Please share your thoughts!");

    const myForm = { rating, comment, productId };

    if (existingReview) {
      dispatch(updateReview(myForm));
    } else {
      dispatch(postReview(myForm));
    }
  };

  const updateHandler = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    if (existingReview) {
      setComment(existingReview.comment);
      setRating(existingReview.rating);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-32 border-t border-gray-100 dark:border-white/5 pt-24 pb-20">
      <h2 className="text-3xl font-light uppercase tracking-[0.2em] mb-16 text-center dark:text-white">
        Community{" "}
        <span className="font-serif italic lowercase text-gray-400">vibes</span>
      </h2>

      {/* --- REVIEW FORM --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gray-50 dark:bg-white/[0.02] rounded-[2rem] p-8 mb-20 border border-transparent dark:border-white/5 shadow-sm"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#77cd3a]/20 flex items-center justify-center text-[#77cd3a]">
            <User size={24} />
          </div>
          <div>
            <h4 className="font-medium dark:text-white text-sm tracking-tight">
              {existingReview
                ? "Edit your experience"
                : "Share your experience"}
            </h4>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(s)}
                >
                  <Star
                    size={16}
                    fill={(hoverRating || rating) >= s ? "#77cd3a" : "none"}
                    className={`transition-all duration-300 ${(hoverRating || rating) >= s ? "text-[#77cd3a] scale-110" : "text-gray-300"}`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={submitHandler}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-white dark:bg-black/20 rounded-2xl p-6 outline-none border border-gray-100 dark:border-white/5 focus:border-[#77cd3a]/50 transition-all dark:text-white min-h-[120px] font-light placeholder:text-gray-300"
            placeholder="Tell us about your organic journey..."
          />
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={reviewLoading || isUpdating}
              className="flex items-center gap-2 px-10 py-4 bg-[#77cd3a] text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#77cd3a]/20"
            >
              {reviewLoading || isUpdating
                ? "Sending..."
                : existingReview
                  ? "Update Review"
                  : "Post Review"}{" "}
              <Send size={18} />
            </button>
          </div>
        </form>
      </motion.div>

      {/* --- REVIEW LIST --- */}
      <div className="space-y-12">
        <AnimatePresence mode="popLayout">
          {allShopReviews &&
            allShopReviews.length > 0 &&
            allShopReviews.map((rev, idx) => (
              <motion.div
                key={rev._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-8 border-l border-gray-100 dark:border-white/5 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={`https://ui-avatars.com/api/?name=${rev.userName}&background=77cd3a&color=fff&rounded=true`}
                      className="w-10 h-10 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500 shadow-sm"
                      alt="avatar"
                    />
                    <div>
                      <h5 className="text-sm font-bold dark:text-white tracking-tight">
                        {rev.userName}
                      </h5>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                        {rev.userId === authUser?._id && "Your Review"}
                      </p>
                      {rev.userId === authUser?._id &&
                        rev.productId === productId && (
                          <button
                            onClick={() => updateHandler()}
                            className="text-[10px] text-[#77cd3a] font-bold uppercase hover:underline flex items-center gap-1"
                          >
                            Edit Review
                          </button>
                        )}
                    </div>
                  </div>

                  <div className="flex gap-0.5 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-lg">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        fill={i < rev.rating ? "#77cd3a" : "none"}
                        className={
                          i < rev.rating ? "text-[#77cd3a]" : "text-gray-200"
                        }
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-light leading-relaxed pl-2 italic">
                  "{rev.comment}"
                </p>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReviewsContainer;
