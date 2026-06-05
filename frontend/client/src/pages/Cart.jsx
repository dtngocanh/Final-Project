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
import { useProductNavigation } from "../hooks/useProductNavigation";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, totalCart } = useSelector((state) => state.cart);
  const { handleCartAction } = useCartActions();

  const { handleProductClick } = useProductNavigation();

  // TÍNH TOÁN GIÁ TRỊ TỔNG ĐƠN HÀNG
  const originalSubtotal =
    cart?.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0) || 0;

  const actualSubtotal = totalCart > 0 ? totalCart : originalSubtotal;
  const totalDiscount = originalSubtotal - actualSubtotal;
  const cartItemsCount =
    cart?.reduce((total, item) => total + item.quantity, 0) || 0;

  if (!cart || cart.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-[#060606] px-6 relative overflow-hidden">
        <FloatingDecor />
        <div className="text-center relative z-10 animate-fade-in">
          <ShoppingBag
            size={64}
            strokeWidth={1}
            className="mx-auto text-gray-200 dark:text-white/10 mb-6 animate-bounce"
            style={{ animationDuration: "3s" }}
          />
          <h1 className="text-3xl font-extralight tracking-tight dark:text-white uppercase mb-8">
            Your Bag is Empty
          </h1>
          <Link
            to="/products"
            className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] bg-[#77cd3a] text-black px-10 py-5 rounded-2xl shadow-lg shadow-[#77cd3a]/20 hover:shadow-[#77cd3a]/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Explore Harvest
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-28 pb-16 bg-white dark:bg-[#060606] flex flex-col relative transition-colors duration-700 overflow-x-hidden">
      <FloatingDecor />
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row max-w-[1500px] mx-auto w-full px-4 md:px-8 gap-8 lg:gap-12">
        {/* BÊN TRÁI: DANH SÁCH SẢN PHẨM (SCROLL CONTAINER) */}
        <div className="w-full lg:w-[62%] flex flex-col">
          {/* TIÊU ĐỀ "MY CART" ĐƯỢC THIẾT KẾ LẠI SIÊU ĐẸP */}
          <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-gray-100 dark:border-white/5">
            {/* Khối bên trái: Chữ và dấu chấm */}
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl md:text-4xl font-extralight tracking-tight text-gray-900 dark:text-white uppercase">
                My Bag
              </h2>
              {/* Dấu chấm nhận diện tối giản */}
              <span className="w-1.5 h-1.5 bg-[#77cd3a] rounded-full"></span>
            </div>

            {/* Khối bên phải: Số lượng item */}
            <div className="text-xs tracking-widest text-gray-400 uppercase font-light">
              {cartItemsCount} {cartItemsCount > 1 ? "items" : "item"}
            </div>
          </div>

          {/* VÙNG CUỘN SẢN PHẨM TỰ ĐỘNG KHI CÓ NHIỀU ITEM */}
          <div className="flex-1 max-h-[580px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => {
                const product = item.product || {};
                const isComboItem = item.price && item.price < product.price;
                const displayPrice = item.price || product.price || 0;

                return (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex gap-4 md:gap-6 p-4 md:p-5 bg-gray-50/50 dark:bg-white/[0.01] hover:bg-white dark:hover:bg-white/[0.03] rounded-3xl border border-gray-100/60 dark:border-white/[0.03] hover:border-gray-200/80 dark:hover:border-white/10 hover:shadow-xl hover:shadow-gray-100/40 dark:hover:shadow-none group relative items-center transition-all duration-300"
                  >
                    {/* Ảnh sản phẩm hình khối sang trọng */}
                    <div
                      onClick={() => handleProductClick(product._id)}
                      className="w-24 h-24 md:w-28 md:h-28 bg-white dark:bg-[#0c0c0c] rounded-2xl overflow-hidden p-3 flex-shrink-0 border border-gray-100 dark:border-white/5 shadow-2xs flex items-center justify-center relative"
                    >
                      <img
                        src={
                          product.images?.[0]?.url ||
                          "https://via.placeholder.com/150"
                        }
                        className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
                        alt={product.name}
                      />
                    </div>

                    {/* Chi tiết thông tin */}
                    <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between min-w-0 gap-4">
                      <div className="space-y-2 max-w-sm md:max-w-md">
                        <h3 className="text-sm md:text-base font-medium text-gray-800 dark:text-white uppercase tracking-tight truncate">
                          {product.name}
                        </h3>

                        {/* Tag deals & Đơn giá */}
                        <div className="flex items-center gap-2.5">
                          {isComboItem ? (
                            <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-600 dark:text-[#77cd3a] px-2 py-0.5 rounded uppercase tracking-wider">
                              Combo Deal
                            </span>
                          ) : (
                            <span className="text-[8px] font-bold bg-gray-200/60 dark:bg-white/5 text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded uppercase tracking-wider">
                              Standard
                            </span>
                          )}
                          <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                            ${displayPrice.toLocaleString()} / kg
                          </span>
                        </div>

                        {/* Thông báo số lượng khẩn cấp */}
                        {product.stock <= 5 && (
                          <p className="text-[9px] text-red-500 font-bold tracking-wider uppercase bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-md w-max animate-pulse">
                            Only {product.stock} left
                          </p>
                        )}
                      </div>

                      {/* Control tăng giảm số lượng & Thành tiền */}
                      <div className="flex items-center justify-between md:justify-end gap-6 md:gap-8 shrink-0">
                        {/* Bộ tăng giảm số lượng tinh gọn */}
                        <div className="flex items-center gap-3 bg-white dark:bg-[#0c0c0c] px-3 py-2 rounded-xl border border-gray-100 dark:border-white/5 shadow-3xs">
                          <button
                            onClick={() =>
                              handleCartAction(product, "UPDATE_QTY", -1)
                            }
                            className="text-gray-400 hover:text-[#77cd3a] transition-colors p-0.5"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-xs font-bold dark:text-white w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleCartAction(product, "UPDATE_QTY", 1)
                            }
                            disabled={item.quantity >= product.stock}
                            className={`text-gray-400 hover:text-[#77cd3a] transition-colors p-0.5 ${
                              item.quantity >= product.stock
                                ? "opacity-20 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        {/* Tổng giá trị của dòng sản phẩm này */}
                        <div className="w-24 text-right flex flex-col justify-center">
                          {isComboItem && (
                            <span className="text-[10px] line-through text-gray-300 dark:text-gray-600 block mb-0.5">
                              $
                              {(product.price * item.quantity).toLocaleString()}
                            </span>
                          )}
                          <span
                            className={`text-base font-semibold tracking-tight block ${isComboItem ? "text-[#77cd3a]" : "text-gray-900 dark:text-white"}`}
                          >
                            ${(displayPrice * item.quantity).toLocaleString()}
                          </span>
                        </div>

                        {/* Nút xóa item chuyển động xuất hiện */}
                        <button
                          onClick={() => handleCartAction(product, "REMOVE")}
                          className="p-2 text-gray-300 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 transition-all md:opacity-0 md:group-hover:opacity-100 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5"
                        >
                          <Trash2 size={15} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* BÊN PHẢI: TỔNG TIỀN (SUMMARY CARD CỐ ĐỊNH KHI CỦỒN) */}
        <div className="w-full lg:w-[38%] bg-gray-50/40 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 backdrop-blur-xl p-6 md:p-10 rounded-3xl flex flex-col justify-between min-h-[450px] h-fit lg:sticky lg:top-28 shadow-2xs">
          <div className="w-full relative z-10">
            <div className="space-y-6 mb-8">
              <div className="flex items-center gap-3 text-[#77cd3a]">
                <Leaf size={15} className="animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em]">
                  Harvest Summary
                </span>
              </div>

              <div className="space-y-4 bg-white dark:bg-black/30 p-5 rounded-2xl border border-gray-100/50 dark:border-white/[0.02]">
                <div className="flex justify-between text-xs font-medium text-gray-400">
                  <span>Original Subtotal</span>
                  <span className="text-gray-800 dark:text-zinc-200">
                    ${originalSubtotal.toLocaleString()}
                  </span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-xs text-red-500 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping inline-block mr-1"></span>
                      Combo Discount
                    </span>
                    <span className="font-bold">
                      -${totalDiscount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="pt-5 flex flex-col gap-1 border-t border-gray-100 dark:border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    Estimated Total
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl md:text-5xl font-light tracking-tighter text-gray-900 dark:text-white leading-none">
                      ${actualSubtotal.toLocaleString()}
                    </span>
                    {totalDiscount > 0 && (
                      <span className="text-xs line-through text-gray-400/40">
                        ${originalSubtotal.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Cụm nút bấm hành động */}
            <div className="space-y-3">
              <button
                onClick={() =>
                  navigate("/checkout", { state: { subtotal: actualSubtotal } })
                }
                className="w-full py-4.5 bg-black dark:bg-[#77cd3a] text-white dark:text-black font-bold rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-gray-200/50 dark:shadow-none transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
              >
                <span className="text-[11px] uppercase tracking-[0.25em]">
                  Proceed to Checkout
                </span>
                <ArrowRight size={15} />
              </button>

              <Link
                to="/products"
                className="w-full py-4 bg-transparent border border-gray-200 dark:border-white/10 text-gray-400 hover:text-black dark:hover:text-white rounded-2xl flex items-center justify-center gap-2 transition-all text-[10px] uppercase tracking-[0.2em] font-bold"
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
