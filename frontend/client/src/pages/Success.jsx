import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux"; // Sửa lại: import useDispatch ở đây
import {
  CheckCircle,
  ShoppingBag,
  Package,
  Sparkles,
  ShoppingCart,
  Star,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

import RecommendSuccess from "../components/Layout/RecommendSuccess";

import { fetchRecommendations } from "../store/slices/recommendSlice";
import { axiosInstance } from "../lib/axios";
import { addToCartThunk } from "../store/slices/cartSlice";
import { toast } from "react-toastify";

const Success = () => {
  const dispatch = useDispatch(); // Khai báo dispatch từ hook

  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const confirmPayment = async () => {
      if (!sessionId) return; // Nếu là đơn COD hoặc không có ID thì bỏ qua

      try {
        // Gửi sessionId lên backend khớp với API confirm bạn đã viết
        const res = await axiosInstance.post("/payment/confirm", { sessionId });

        if (res.data.success) {
          toast.success("Payment confirmed successfully!");
        }
      } catch (error) {
        console.error("Payment confirmation error:", error);
        toast.error(
          error.response?.data?.message || "Failed to verify your payment",
        );
      }
    };

    confirmPayment();
  }, [sessionId]);

  // Lấy data từ store
  const { list: recommendedList, isLoading } = useSelector(
    (state) => state.recommend,
  );
  const { authUser } = useSelector((state) => state.auth);

  const isGuest = !authUser;

  // Gọi API lấy gợi ý ngay khi vào trang nếu là Member
  useEffect(() => {
    if (authUser) {
      // 2. Đổi tên hàm khi dispatch
      dispatch(fetchRecommendations());
    }
  }, [dispatch, authUser]);
  // Lấy 3 sản phẩm đầu làm Hot Deal
  const hotDeals = recommendedList ? recommendedList.slice(0, 3) : [];

  const onAddToCart = (e, product) => {
    e.preventDefault();
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

    // handleCartAction(product, "ADD", 1);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-12 px-4 md:px-6">
      <div
        className={`${isGuest ? "max-w-2xl" : "max-w-6xl"} w-full mb-16 transition-all duration-500`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`
            w-full bg-white rounded-[3rem]
            shadow-2xl shadow-slate-200/60
            overflow-hidden border border-white relative flex
            ${isGuest ? "justify-center" : "flex-col lg:flex-row"}
          `}
        >
          {/* CỘT TRÁI: THÔNG BÁO THÀNH CÔNG */}
          <div
            className={`
            p-10 md:p-14 flex flex-col justify-center
            ${
              isGuest
                ? "flex-1 items-center text-center"
                : "flex-[0.8] items-center text-center lg:items-start lg:text-left border-b lg:border-b-0 lg:border-r border-slate-100"
            }
          `}
          >
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-xs font-bold mb-6 w-fit">
              <CheckCircle size={14} /> Order Confirmed
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
              Success! <br />
              <span className="text-[#77cd3a]">Freshness</span> is coming.
            </h1>

            <div
              className={`flex flex-col mb-8 ${isGuest ? "items-center" : "items-center lg:items-start"}`}
            >
              <p className="text-slate-500 text-lg mb-6 max-w-sm">
                Your order has been received and is being prepared with love.
              </p>
              <motion.div
                animate={{ y: [0, -5, 0], rotate: [-2, 2, -2] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="relative"
              >
                <img
                  src="/TOMATOGIF.gif"
                  alt="Tomato Mascot"
                  className="w-20 h-20 md:w-24 md:h-24 object-contain"
                />
                <div className="absolute -top-4 -right-8 bg-[#77cd3a] text-white text-[8px] font-black px-2 py-1 rounded-lg rotate-12 shadow-sm">
                  THANKS!
                </div>
              </motion.div>
            </div>

            <div
              className={`flex flex-col sm:flex-row gap-4 w-full ${isGuest ? "justify-center max-w-md" : ""}`}
            >
              {!isGuest && (
                <Link
                  to="/orders"
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg"
                >
                  <Package size={18} /> Track Order
                </Link>
              )}
              <Link
                to="/"
                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 px-6 rounded-2xl transition-all"
              >
                <ShoppingBag size={18} /> Shop More
              </Link>
            </div>
          </div>

          {/* CỘT PHẢI: HOT DEALS (Ẩn nếu là khách) */}
          {!isGuest && (
            <div className="flex-[1.2] bg-slate-50/50 p-8 md:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-orange-500 font-black text-xs uppercase tracking-widest mb-2">
                <Sparkles size={14} fill="currentColor" /> One-time Offer
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-8">
                Get <span className="text-red-500">10% OFF</span>
              </h2>

              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#77cd3a]" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {hotDeals.map((product, idx) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 group flex flex-col"
                    >
                      <Link to={`/product/${product._id}`} className="flex-1">
                        <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden mb-4 flex items-center justify-center p-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <h3 className="font-bold text-slate-800 text-[11px] mb-2 line-clamp-1 group-hover:text-[#77cd3a]">
                          {product.name}
                        </h3>
                        <div className="flex flex-col mb-3">
                          <span className="text-sm font-black text-[#77cd3a]">
                            ${(product.price * 0.9).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400 line-through">
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                      </Link>
                      <button
                        onClick={(e) => onAddToCart(e, product)}
                        className="w-full bg-slate-900 text-white py-2.5 rounded-xl hover:bg-[#77cd3a] transition-all flex items-center justify-center gap-2 text-[10px] font-bold shadow-md"
                      >
                        <ShoppingCart size={12} /> Add
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* DƯỚI CÙNG: RECOMMENDATION (Ẩn nếu là khách) */}
      {!isGuest && (
        <div className="w-full max-w-[1400px]">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              Recommended For You
            </h2>
            <div className="h-[2px] flex-1 bg-slate-100"></div>
          </div>
          <RecommendSuccess />
        </div>
      )}

      <style>{`
        body { background-image: radial-gradient(#cbd5e1 0.5px, transparent 0.5px); background-size: 30px 30px; }
      `}</style>
    </div>
  );
};

export default Success;
