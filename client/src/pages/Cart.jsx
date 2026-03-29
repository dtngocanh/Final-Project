import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Leaf, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { updateCartQuantity, removeFromCart } from "../store/slices/cartSlice";
import FloatingDecor from "../components/Fruit/FloatingDecor";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.cart);

  const total = cart?.reduce((sum, item) => sum + item.product.price * item.quantity, 0) || 0;
  const cartItemsCount = cart?.reduce((total, item) => total + item.quantity, 0) || 0;

  const updateQuantity = (productId, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty <= 0) {
      dispatch(removeFromCart({ id: productId }));
    } else {
      dispatch(updateCartQuantity({ id: productId, quantity: change }));
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-[#060606] px-6 relative overflow-hidden">
        <FloatingDecor />
        <div className="text-center relative z-10">
          <ShoppingBag size={64} strokeWidth={1} className="mx-auto text-gray-200 dark:text-white/10 mb-6" />
          <h1 className="text-3xl font-light tracking-tighter dark:text-white uppercase mb-8">Your Bag is Empty</h1>
          <Link to="/products" className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] bg-[#77cd3a] text-black px-10 py-5 rounded-2xl">
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
        {/* BÊN TRÁI: DANH SÁCH ITEM */}
        <div className="w-full lg:w-[60%] flex flex-col p-6 md:p-12 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-4xl md:text-5xl font-extralight tracking-tighter dark:text-white">
              My <span className="font-serif italic border-b-2 border-[#77cd3af2]/30">cart</span>
            </h2>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-[0.2em] bg-gray-50 dark:bg-white/5 px-4 py-1.5 rounded-full border border-gray-100 dark:border-white/10">
              {cartItemsCount} Items
            </span>
          </div>

          <div className="flex-1 space-y-2">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => (
                <motion.div key={item.product._id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="flex gap-4 md:gap-6 py-8 border-b border-gray-100 dark:border-white/[0.04] group relative">
                  <div className="w-20 h-20 md:w-32 md:h-32 bg-gray-50 dark:bg-white/[0.02] rounded-[24px] md:rounded-[32px] overflow-hidden p-4 flex-shrink-0 border border-gray-100 dark:border-white/5">
                    <img src={item.product.images?.[0]?.url} className="w-full h-full object-contain" alt="" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm md:text-lg font-light tracking-tight dark:text-white uppercase leading-tight">{item.product.name}</h3>
                        <p className="text-[9px] md:text-[10px] text-gray-400 font-mono mt-1 italic tracking-widest uppercase">Organic • ${item.product.price}</p>
                      </div>
                      <button onClick={() => dispatch(removeFromCart({ id: item.product._id }))} className="p-2 text-gray-300 hover:text-red-400 transition-colors md:opacity-0 md:group-hover:opacity-100">
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3 md:gap-5 bg-white dark:bg-black/40 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
                        <button onClick={() => updateQuantity(item.product._id, item.quantity, -1)} className="text-gray-400 hover:text-[#77cd3a]"><Minus size={12} /></button>
                        <span className="text-xs font-mono font-bold dark:text-white w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product._id, item.quantity, 1)} className="text-gray-400 hover:text-[#77cd3a]"><Plus size={12} /></button>
                      </div>
                      <span className="text-xl md:text-2xl font-light tracking-tighter dark:text-white">${(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* BÊN PHẢI: TỔNG TIỀN */}
        <div className="w-full lg:w-[40%] bg-gray-50/30 dark:bg-white/[0.01] backdrop-blur-xl p-6 md:p-12 flex flex-col justify-center relative min-h-[400px]">
          <div className="max-w-md mx-auto w-full relative z-10">
            <div className="space-y-8 md:space-y-10 mb-12">
              <div className="flex items-center gap-3 text-[#77cd3a]">
                <Leaf size={16} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">Harvest Summary</span>
              </div>
              <div className="space-y-5">
                <div className="flex justify-between text-[11px] uppercase tracking-widest text-gray-400">
                  <span>Subtotal</span>
                  <span className="dark:text-white font-mono">${total.toLocaleString()}</span>
                </div>
                {/* <div className="flex justify-between text-[11px] uppercase tracking-widest text-gray-400 font-mono">
                  <span>Shipping Fee</span>
                  <span>$7.00</span>
                </div> */}
                <div className="pt-6 flex flex-col gap-1 border-t border-gray-200 dark:border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 dark:text-white/20">Estimated Total</span>
                  <span className="text-5xl md:text-7xl font-extralight tracking-tighter dark:text-white leading-none">${(total).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Nút thanh toán bay thẳng qua Payment */}
              <button 
                onClick={() => navigate("/payment", { state: { subtotal: total } })}
                className="w-full py-5 md:py-6 bg-black dark:bg-[#77cd3a] text-white dark:text-black font-bold rounded-[20px] md:rounded-[24px] flex items-center justify-center gap-4 shadow-2xl transition-transform active:scale-95"
              >
                <span className="text-[10px] md:text-[11px] uppercase tracking-[0.4em]">Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>
              
              <Link to="/products" className="w-full py-4 border border-gray-200 dark:border-white/10 text-gray-400 hover:text-black dark:hover:text-white rounded-2xl flex items-center justify-center gap-3 transition-all text-[9px] uppercase tracking-[0.4em] font-bold">
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