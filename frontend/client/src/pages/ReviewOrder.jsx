import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, ChevronLeft, Leaf } from "lucide-react";
import { toast } from "react-toastify";

import { fetchOrderDetails } from "../store/slices/orderSlice";
import {
  postReview,
  updateReview,
  fetchAllShopReviews,
  clearReviewState,
} from "../store/slices/productSlice";

import FloatingDecor from "../components/Fruit/FloatingDecor";

const ReviewOrderPage = () => {
  const { id } = useParams(); // Order ID
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { orderDetail } = useSelector((state) => state.order);
  const {
    allShopReviews,
    isSuccess,
    reviewLoading: reduxLoading,
  } = useSelector((state) => state.product);
  const { authUser } = useSelector((state) => state.auth);

  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderDetails(id));
      dispatch(fetchAllShopReviews());
    }
  }, [dispatch, id]);

  
  const orderItems = useMemo(
    () => orderDetail?.orderItems || [],
    [orderDetail],
  );

  // 2. LOGIC KIỂM TRA: Đơn hàng này đã được đánh giá hết chưa
  const isOrderFullyReviewed = useMemo(() => {
    if (!orderItems.length || !allShopReviews || !authUser) return false;

    // Kiểm tra xem tất cả các sản phẩm trong đơn hàng này đã có review của authUser chưa
    return orderItems.every((item) => {
      const pId = (item.product?._id || item.product || item._id).toString();
      return allShopReviews.some(
        (rev) =>
          (rev.product?._id || rev.product)?.toString() === pId &&
          rev.user?._id?.toString() === authUser?._id?.toString() &&
          rev.order?.toString() === id?.toString(),
      );
    });
  }, [orderItems, allShopReviews, authUser]);

  // Nếu đã review toàn bộ đơn hàng, đẩy user về trang danh sách đơn hàng ngay lập tức
  useEffect(() => {
    if (isOrderFullyReviewed) {
      toast.info("You have already reviewed all products in this order!");
      navigate("/orders", { replace: true });
    }
  }, [isOrderFullyReviewed, navigate]);

  // Điền sẵn dữ liệu cũ
  useEffect(() => {
    if (orderItems.length && allShopReviews && authUser) {
      const initialRatings = {};
      const initialComments = {};

      orderItems.forEach((item) => {
        const pId = (item.product?._id || item.product || item._id).toString();
        const found = allShopReviews.find(
          (rev) =>
            (rev.product?._id || rev.product)?.toString() === pId &&
            rev.user?._id?.toString() === authUser?._id?.toString() &&
            rev.order?.toString() === id?.toString(),
        );
        if (found) {
          initialRatings[pId] = found.rating;
          initialComments[pId] = found.comment;
        }
      });

      setRatings((prev) => ({ ...initialRatings, ...prev }));
      setComments((prev) => ({ ...initialComments, ...prev }));
    }
  }, [orderItems, allShopReviews, authUser]);

  const handleRatingChange = (productId, value) => {
    setRatings((prev) => ({ ...prev, [productId]: value }));
  };

  const handleCommentChange = (productId, value) => {
    setComments((prev) => ({ ...prev, [productId]: value }));
  };

  // 3. HÀM XỬ LÝ LƯU DATABASE
  const submitHandler = async (e) => {
    e.preventDefault();

    if (Object.keys(ratings).length === 0) {
      toast.error("Please rate at least one product before submitting!");
      return;
    }

    setLocalLoading(true);

    // Chuẩn bị danh sách các hành động cần dispatch lên database
    const promises = orderItems
      .map((item) => {
        const pId = (item.product?._id || item.product || item._id).toString();
        const rating = ratings[pId] || 0;
        const comment = comments[pId] || "";

        if (rating === 0) return null; // Bỏ qua sản phẩm không vote sao

        // Tìm xem sản phẩm này trước đó user đã review chưa để chọn hàm POST hoặc UPDATE
        const isExisting = allShopReviews.some(
          (rev) =>
            (rev.product?._id || rev.product)?.toString() === pId &&
            rev.user?._id?.toString() === authUser?._id?.toString() &&
            rev.order?.toString() === id?.toString(),
        );

        const payload = { rating, comment, productId: pId, orderId: id };

        return isExisting
          ? dispatch(updateReview(payload)).unwrap()
          : dispatch(postReview(payload)).unwrap();
      })
      .filter(Boolean); // Loại bỏ các giá trị null

    try {
      // Thực thi đồng thời tất cả các lượt lưu sản phẩm vào DB
      await Promise.all(promises);

      dispatch(clearReviewState());
      dispatch(fetchAllShopReviews()); // Refresh lại kho dữ liệu review
      setIsSubmitted(true);
    } catch (error) {
      console.error("Review submit error:", error);
      toast.error(
        error?.message || "Something went wrong while saving reviews.",
      );
    } finally {
      setLocalLoading(false);
    }
  };

  if (!orderDetail)
    return (
      <div className="pt-32 text-center font-fredoka uppercase tracking-[0.4em] text-gray-400">
        Loading Order Data...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fcfbfa] dark:bg-[#060606] pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-stone-900 dark:text-stone-100 font-fredoka relative overflow-hidden transition-colors duration-700">
      <FloatingDecor />

      <div className="max-w-3xl mx-auto relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-[#77cd3a] mb-8 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
            Back to Order Details
          </span>
        </button>

        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#faf9f5] dark:bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] p-6 md:p-10 border-2 border-[#77cd3a]/15 dark:border-white/5 shadow-[0_16px_40px_rgba(119,205,58,0.04)] relative overflow-hidden"
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#77cd3a]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-200/10 rounded-full blur-3xl pointer-events-none" />

              <div className="mb-8 pb-6 border-b border-emerald-100/50 dark:border-white/[0.05] relative z-10">
                <h4 className="text-2xl font-bold text-emerald-950 dark:text-gray-100 tracking-tight uppercase">
                  How was your fresh batch?
                </h4>
                <p className="text-xs text-emerald-700/60 dark:text-[#77cd3a]/60 font-bold mt-1 tracking-wide">
                  Order ID: {orderDetail?._id} — Share your organic experience
                  to help others pick the best harvest.
                </p>
              </div>

              <form
                onSubmit={submitHandler}
                className="space-y-8 relative z-10"
              >
                {orderItems.map((item) => {
                  const productId = (
                    item.product?._id ||
                    item.product ||
                    item._id
                  ).toString();
                  const currentRating = ratings[productId] || 0;
                  const currentComment = comments[productId] || "";

                  return (
                    <div
                      key={item._id}
                      className="bg-white dark:bg-black/40 p-5 md:p-6 rounded-[2rem] border border-emerald-100/60 dark:border-white/5 space-y-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 rounded-2xl object-cover border border-emerald-100/50 dark:border-white/5 bg-stone-100 dark:bg-zinc-900"
                          />
                          <div>
                            <h5 className="font-bold text-emerald-950 dark:text-gray-200 text-base uppercase tracking-tight">
                              {item.name}
                            </h5>
                            <p className="text-[10px] text-stone-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                              Qty: {item.quantity} | Price: $
                              {item.price?.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-1 bg-[#faf9f5] dark:bg-stone-950 px-3 py-2 rounded-full border border-emerald-50 dark:border-white/[0.03] shadow-inner">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleRatingChange(productId, s)}
                              className="p-0.5 hover:scale-125 active:scale-90 transition-transform duration-150 cursor-pointer"
                            >
                              <Star
                                size={22}
                                fill={currentRating >= s ? "#77cd3a" : "none"}
                                className={`transition-all duration-200 ${
                                  currentRating >= s
                                    ? "text-[#77cd3a] drop-shadow-[0_2px_4px_rgba(119,205,58,0.3)]"
                                    : "text-amber-200 dark:text-stone-700 hover:text-[#77cd3a]/60"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="relative">
                        <textarea
                          value={currentComment}
                          onChange={(e) =>
                            handleCommentChange(productId, e.target.value)
                          }
                          maxLength={500}
                          className="w-full bg-[#faf9f5] dark:bg-stone-950/60 text-emerald-950 dark:text-gray-200 rounded-[1.5rem] p-5 pr-16 pb-10 outline-none border border-emerald-100/50 dark:border-stone-800/60 focus:border-[#77cd3a] focus:ring-4 focus:ring-[#77cd3a]/5 transition-all min-h-[110px] resize-none placeholder-emerald-900/30 dark:placeholder-gray-600 text-sm leading-relaxed"
                          placeholder={`Tell others about the freshness, taste, or packaging of this ${item.name?.toLowerCase()}...`}
                        />
                        <div className="absolute bottom-4 right-5 text-[11px] text-emerald-700/50 dark:text-gray-500 font-bold pointer-events-none select-none">
                          {currentComment.length}/500
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-end pt-4 border-t border-emerald-100/30 dark:border-white/[0.02]">
                  <button
                    type="submit"
                    disabled={localLoading || reduxLoading}
                    className="group flex items-center justify-center gap-2 px-8 py-4 bg-[#77cd3a] hover:bg-[#6ab933] text-white font-bold text-sm rounded-full shadow-md shadow-[#77cd3a]/20 hover:shadow-lg hover:shadow-[#77cd3a]/30 disabled:opacity-40 disabled:pointer-events-none transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
                  >
                    {localLoading || reduxLoading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span className="uppercase tracking-wider text-xs">
                          Submitting to Database...
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="uppercase tracking-wider text-xs">
                          Submit All Reviews
                        </span>
                        <Send
                          size={14}
                          className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                        />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#faf9f5] dark:bg-white/[0.02] border border-emerald-100/20 dark:border-white/5 rounded-[2.5rem] p-12 text-center shadow-xl max-w-md mx-auto relative overflow-hidden"
            >
              <div className="w-16 h-16 bg-[#77cd3a]/15 text-[#77cd3a] rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf size={32} className="animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-emerald-950 dark:text-gray-100 mb-2 uppercase tracking-tight">
                Thank you for your review!
              </h3>
              <p className="text-xs text-stone-500 dark:text-gray-400 mb-8 font-medium">
                Your feedback helps us continuously harvest and deliver the best
                nature has to offer.
              </p>
              <button
                onClick={() => navigate("/orders", { replace: true })}
                className="w-full py-3.5 bg-[#77cd3a] hover:bg-[#6ab933] text-white font-bold text-xs rounded-xl uppercase tracking-widest transition-all cursor-pointer shadow-md"
              >
                Back to My Orders
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReviewOrderPage;
