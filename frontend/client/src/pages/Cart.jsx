import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Leaf,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import FloatingDecor from "../components/Fruit/FloatingDecor";
import { useCartActions } from "../hooks/useCartActions";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, totalCart } = useSelector((state) => state.cart);

  const { handleCartAction } = useCartActions();

  // 1. TÍNH TOÁN GIÁ TRỊ TỔNG ĐƠN HÀNG
  // Tính tổng giá gốc (chưa giảm) của toàn bộ giỏ hàng để đối chiếu
  const originalSubtotal = cart?.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0) || 0;

  // Tổng tiền thực tế sau khi đã áp các combo (Lấy trực tiếp từ Redux state được đồng bộ với DB)
  const actualSubtotal = totalCart > 0 ? totalCart : originalSubtotal;

  // Số tiền tiết kiệm được từ Combo
  const totalDiscount = originalSubtotal - actualSubtotal;

  // Tổng số lượng item trong giỏ
  const cartItemsCount = cart?.reduce((total, item) => total + item.quantity, 0) || 0;

  if (!cart || cart.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-[#060606] px-6 relative overflow-hidden">
        <FloatingDecor />
        <div className="text-center relative z-10">
          <ShoppingBag
            size={64}
            strokeWidth={1}
            className="mx-auto text-gray-200 dark:text-white/10 mb-6"
          />
          <h1 className="text-3xl font-light tracking-tighter dark:text-white uppercase mb-8">
            Your Bag is Empty
          </h1>
          <Link
            to="/products"
            className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] bg-[#77cd3a] text-black px-10 py-5 rounded-2xl"
          >
            Explore Harvest
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-20 bg-white dark:bg-[#060606] flex flex-col relative transition-colors duration-700 overflow-x-hidden">
      <FloatingDecor />

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full">
        
        {/* BÊN TRÁI: DANH SÁCH SẢN PHẨM */}
        <div className="w-full lg:w-[60%] flex flex-col p-6 md:p-12 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-4xl md:text-5xl font-extralight tracking-tighter dark:text-white">
              My{" "}
              <span className="font-serif italic border-b-2 border-[#77cd3af2]/30">
                cart
              </span>
            </h2>
            <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] bg-gray-50 dark:bg-white/5 px-4 py-1.5 rounded-full border border-gray-100 dark:border-white/10">
              {cartItemsCount} Items
            </span>
          </div>

          <div className="flex-1 space-y-2">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => {
                const product = item.product || {};
                
                // Nếu giá lưu trong item nhỏ hơn giá gốc của product -> Đây là sản phẩm nằm trong Combo
                const isComboItem = item.price && item.price < product.price;
                const displayPrice = item.price || product.price || 0;

                return (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex gap-4 md:gap-6 py-8 border-b border-gray-100 dark:border-white/[0.04] group relative"
                  >
                    {/* Ảnh sản phẩm */}
                    <div className="w-20 h-20 md:w-32 md:h-32 bg-gray-50 dark:bg-white/[0.02] rounded-[24px] md:rounded-[32px] overflow-hidden p-4 flex-shrink-0 border border-gray-100 dark:border-white/5">
                      <img
                        src={product.images?.[0]?.url}
                        className="w-full h-full object-contain"
                        alt={product.name}
                      />
                    </div>

                    {/* Thông tin chi tiết */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm md:text-lg font-light tracking-tight dark:text-white uppercase leading-tight">
                            {product.name}
                          </h3>

                          {/* Hiển thị tag phân loại & giá đơn vị */}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {isComboItem ? (
                              <span className="text-[8px] font-bold bg-[#77cd3a]/10 text-[#77cd3a] px-2 py-0.5 rounded uppercase tracking-wider">
                                Combo Deal
                              </span>
                            ) : (
                              <span className="text-[8px] font-bold bg-gray-100 dark:bg-white/5 text-gray-400 px-2 py-0.5 rounded uppercase tracking-wider">
                                Standard
                              </span>
                            )}
                            
                            <span className="text-[9px] md:text-[10px] text-gray-400 italic tracking-widest uppercase">
                              • ${displayPrice}
                            </span>
                            
                            {isComboItem && (
                              <span className="text-[9px] line-through text-gray-400/50">
                                ${product.price}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Nút xóa sản phẩm */}
                        <button
                          onClick={() => handleCartAction(product, "REMOVE")}
                          className="p-2 text-gray-300 hover:text-red-400 transition-colors md:opacity-0 md:group-hover:opacity-100"
                        >
                          <Trash2 size={16} strokeWidth={1.5} />
                        </button>
                      </div>

                      {/* Bộ điều khiển số lượng và Hiển thị Tổng giá Item */}
                      <div className="flex items-center justify-between mt-4">
                        {/* Cụm tăng giảm số lượng */}
                        <div className="flex items-center gap-3 md:gap-5 bg-white dark:bg-black/40 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
                          <button
                            onClick={() => handleCartAction(product, "UPDATE_QTY", -1)}
                            className="text-gray-400 hover:text-[#77cd3a]"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold dark:text-white w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleCartAction(product, "UPDATE_QTY", 1)}
                            disabled={item.quantity >= product.stock}
                            className={`text-gray-400 hover:text-[#77cd3a] ${
                              item.quantity >= product.stock ? "opacity-20 cursor-not-allowed" : ""
                            }`}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* HIỂN THỊ TIỀN (Phân biệt rõ rệt Combo vs Thường) */}
                        <div className="flex items-baseline gap-2">
                          {isComboItem ? (
                            <>
                              <span className="text-xs md:text-sm font-light line-through text-gray-400/60">
                                ${(product.price * item.quantity).toLocaleString()}
                              </span>
                              <span className="text-xl md:text-2xl font-normal tracking-tighter text-[#77cd3a]">
                                ${(displayPrice * item.quantity).toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl md:text-2xl font-light tracking-tighter dark:text-white">
                              ${(product.price * item.quantity).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {product.stock <= 5 && (
                        <p className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-tighter">
                          Only {product.stock} left in stock
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* BÊN PHẢI: TỔNG TIỀN (SUMMARY) */}
        <div className="w-full lg:w-[40%] bg-gray-50/30 dark:bg-white/[0.01] backdrop-blur-xl p-6 md:p-12 flex flex-col justify-center relative min-h-[400px]">
          <div className="max-w-md mx-auto w-full relative z-10">
            <div className="space-y-8 md:space-y-10 mb-12">
              <div className="flex items-center gap-3 text-[#77cd3a]">
                <Leaf size={16} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">
                  Harvest Summary
                </span>
              </div>
              
              <div className="space-y-5">
                {/* Giá tổng gốc gốc ban đầu */}
                <div className="flex justify-between text-[11px] uppercase tracking-widest text-gray-400">
                  <span>Original Subtotal</span>
                  <span className="dark:text-white">
                    ${originalSubtotal.toLocaleString()}
                  </span>
                </div>

                {/* Tiền được giảm từ các Combo Section (Chỉ xuất hiện khi có combo thực tế) */}
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-[11px] uppercase tracking-widest text-red-500 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping inline-block mr-1"></span>
                      Combo Discount
                    </span>
                    <span className="font-bold">
                      -${totalDiscount.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Tổng tiền cuối cùng */}
                <div className="pt-6 flex flex-col gap-1 border-t border-gray-200 dark:border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 dark:text-white/20">
                    Estimated Total
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl md:text-7xl font-extralight tracking-tighter dark:text-white leading-none">
                      ${actualSubtotal.toLocaleString()}
                    </span>
                    {totalDiscount > 0 && (
                      <span className="text-sm md:text-base line-through text-gray-400/40">
                        ${originalSubtotal.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="space-y-4">
              <button
                onClick={() =>
                  navigate("/checkout", { state: { subtotal: actualSubtotal } })
                }
                className="w-full py-5 md:py-6 bg-black dark:bg-[#77cd3a] text-white dark:text-black font-bold rounded-[20px] md:rounded-[24px] flex items-center justify-center gap-4 shadow-2xl transition-transform active:scale-95 cursor-pointer"
              >
                <span className="text-[10px] md:text-[11px] uppercase tracking-[0.4em]">
                  Proceed to Checkout
                </span>
                <ArrowRight size={16} />
              </button>

              <Link
                to="/products"
                className="w-full py-4 border border-gray-200 dark:border-white/10 text-gray-400 hover:text-black dark:hover:text-white rounded-2xl flex items-center justify-center gap-3 transition-all text-[9px] uppercase tracking-[0.4em] font-bold"
              >
                <ChevronLeft size={14} /> Add more from garden
              </Link>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
};

export default Cart;