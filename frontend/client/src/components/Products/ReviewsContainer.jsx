import React, { useState, useEffect, useMemo, useRef } from "react";
import { Star, Send, User, ChevronLeft, ChevronRight } from "lucide-react";
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
  const formRef = useRef(null);

  const { authUser } = useSelector((state) => state.auth);
  const { allShopReviews, isSuccess, reviewLoading, isUpdating } = useSelector((state) => state.product);
  const { myOrders } = useSelector((state) => state.order);

  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  const [isHashTriggered, setIsHashTriggered] = useState(window.location.hash === "#reviews");

  useEffect(() => {
    dispatch(fetchAllShopReviews());
    const handleHashChange = () => {
      if (window.location.hash === "#reviews") setIsHashTriggered(true);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [dispatch]);

  const canUserReview = useMemo(() => {
    if (!authUser || !myOrders) return false;
    return myOrders.some((order) => 
      order.orderStatus === "Delivered" && 
      order.orderItems.some((item) => (item.product._id || item.product).toString() === productId?.toString())
    );
  }, [myOrders, productId, authUser]);

  const shouldShowForm = useMemo(() => canUserReview || isHashTriggered, [canUserReview, isHashTriggered]);

  const productReviews = useMemo(() => {
    return (allShopReviews || []).filter((rev) => (rev.product?._id || rev.product)?.toString() === productId?.toString());
  }, [allShopReviews, productId]);

  const totalPages = Math.ceil(productReviews.length / reviewsPerPage);
  const currentReviews = useMemo(() => {
    return productReviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage);
  }, [productReviews, currentPage]);

  const existingReview = useMemo(() => productReviews.find((rev) => rev.user?._id?.toString() === authUser?._id?.toString()), [productReviews, authUser]);

  useEffect(() => {
    if (existingReview) {
      setComment(existingReview.comment);
      setRating(existingReview.rating);
    }
  }, [existingReview]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(existingReview ? "Review updated!" : "Review submitted!");
      dispatch(clearReviewState());
      dispatch(fetchAllShopReviews());
    }
  }, [isSuccess, dispatch, existingReview]);

  const scrollToFormHandler = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  const submitHandler = (e) => {
    e.preventDefault();
    if (!comment.trim()) return toast.warn("Please write something first!");
    existingReview ? dispatch(updateReview({ rating, comment, productId })) : dispatch(postReview({ rating, comment, productId }));
  };

  return (
    <div className="max-w-4xl mx-auto mt-20 md:mt-32 border-t border-gray-100 dark:border-white/10 pt-16 md:pt-24 pb-20 px-4 md:px-6">
      <div className="mb-16 text-center">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#77cd3a] mb-4 block">Community Feedback</span>
        <h2 className="text-3xl md:text-5xl font-extralight text-gray-950 dark:text-white tracking-tighter">What others say</h2>
      </div>

      <AnimatePresence>
        {shouldShowForm && (
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-white/[0.02] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 mb-20 border border-gray-100 dark:border-white/[0.08] shadow-sm"
          >
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#77cd3a]/10 flex items-center justify-center text-[#77cd3a]">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="font-semibold dark:text-white">{existingReview ? "Update review" : "Share your thoughts"}</h4>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-bold">Your opinion matters</p>
                </div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setRating(s)} className="p-1 hover:scale-110 transition-transform">
                    <Star size={24} fill={rating >= s ? "#77cd3a" : "none"} className={rating >= s ? "text-[#77cd3a]" : "text-gray-200"} />
                  </button>
                ))}
              </div>
            </div>
            <form onSubmit={submitHandler} className="space-y-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-gray-50 dark:bg-black/20 rounded-2xl p-6 outline-none border border-transparent focus:border-[#77cd3a]/30 transition-all dark:text-white min-h-[120px]"
                placeholder="Write your review here..."
              />
              <div className="flex justify-end">
                <button type="submit" disabled={reviewLoading} className="flex items-center gap-2 px-8 py-3.5 bg-black dark:bg-[#77cd3a] text-white dark:text-black font-bold rounded-full hover:scale-105 transition-all">
                  {reviewLoading ? "Processing..." : existingReview ? "Save Changes" : "Post Review"}
                  {!reviewLoading && <Send size={16} />}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-12">
        <AnimatePresence mode="popLayout">
          {currentReviews.length > 0 ? (
            <motion.div key={currentPage} className="space-y-10">
              {currentReviews.map((rev) => (
                <div key={rev._id} className="flex gap-4 md:gap-6 group">
                  <img src={`https://ui-avatars.com/api/?name=${rev.user?.name}&background=f3f4f6&color=9ca3af&rounded=true`} className="w-10 h-10 md:w-12 md:h-12 rounded-full" alt="avatar" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-bold text-gray-950 dark:text-white">{rev.user?.name}</h5>
                        <div className="flex gap-0.5 mt-1">
                          {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < rev.rating ? "#77cd3a" : "none"} className={i < rev.rating ? "text-[#77cd3a]" : "text-gray-200"} />)}
                        </div>
                      </div>
                      {rev.user?._id === authUser?._id && <button onClick={scrollToFormHandler} className="text-[10px] font-bold uppercase text-gray-400 hover:text-[#77cd3a]">Edit</button>}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed">{rev.comment}</p>
                  </div>
                </div>
              ))}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-6 pt-10">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
                  <span className="text-xs font-bold dark:text-white">Page {currentPage} / {totalPages}</span>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full"><ChevronRight size={20} /></button>
                </div>
              )}
            </motion.div>
          ) : (
            <p className="text-center text-gray-400 font-light italic py-10">No reviews yet.</p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReviewsContainer;