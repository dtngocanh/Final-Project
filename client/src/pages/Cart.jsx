import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Leaf, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { updateCartQuantity, removeFromCart } from "../store/slices/cartSlice";

const Cart = () => {
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);

  const total = cart?.reduce((sum, item) => sum + item.product.price * item.quantity, 0) || 0;
  const cartItemsCount = cart?.reduce((total, item) => total + item.quantity, 0) || 0;

  const updateQuantity = (id, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty <= 0) {
      dispatch(removeFromCart({ id }));
    } else {
      dispatch(updateCartQuantity({ id, quantity: change }));
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-[#060606] px-6">
        <div className="text-center">
          <ShoppingBag size={48} className="mx-auto text-gray-200 dark:text-white/5 mb-6" />
          <h1 className="text-2xl font-light tracking-tighter dark:text-white uppercase mb-8">Empty Bag</h1>
          <Link to="/products" className="text-[10px] font-bold uppercase tracking-[0.3em] bg-[#77cd3a] text-black px-8 py-4 rounded-2xl">Start Exploring</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen pt-20 overflow-hidden bg-white dark:bg-[#060606] flex flex-col transition-colors duration-500">
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full overflow-hidden">
        
        {/* BÊN TRÁI: DANH SÁCH (Chiếm 60% - Cuộn nội bộ) */}
        <div className="lg:w-[60%] flex flex-col p-6 md:p-12 overflow-hidden border-r border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl md:text-5xl font-extralight tracking-tighter dark:text-white">
              My <span className="font-serif italic text-[#77cd3a]">Selection</span>
            </h2>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-[0.2em] bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-full">
              {cartItemsCount} Items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-[#77cd3a]/20">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => (
                <motion.div
                  key={item.product.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex gap-6 py-6 border-b border-gray-100 dark:border-white/[0.03] group relative"
                >
                  <div className="w-20 h-20 md:w-28 md:h-28 bg-gray-50 dark:bg-white/[0.02] rounded-[24px] overflow-hidden p-4 flex-shrink-0 border border-gray-100 dark:border-white/5 group-hover:border-[#77cd3a]/30 transition-all">
                    <img src={item.product.image} className="w-full h-full object-contain" alt="" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm md:text-base font-medium tracking-tight dark:text-white uppercase leading-tight">
                          {item.product.name}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-mono mt-1">${item.product.price} / unit</p>
                      </div>
                      <button onClick={() => dispatch(removeFromCart({ id: item.product.id }))} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 bg-white dark:bg-black/40 px-3 py-1.5 rounded-full border border-gray-100 dark:border-white/10">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity, -1)} className="text-gray-400 hover:text-[#77cd3a]"><Minus size={12} /></button>
                        <span className="text-[11px] font-mono dark:text-white w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity, 1)} className="text-gray-400 hover:text-[#77cd3a]"><Plus size={12} /></button>
                      </div>
                      <span className="text-lg font-light tracking-tighter dark:text-white">${(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* BÊN PHẢI: TỔNG KẾT (Chiếm 40% - Cố định) */}
        <div className="lg:w-[40%] bg-gray-50/50 dark:bg-white/[0.01] p-6 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="space-y-8 mb-12">
              <div className="flex items-center gap-3 text-[#77cd3a]">
                <Leaf size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">Order Summary</span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-[11px] uppercase tracking-widest text-gray-400 font-light">
                  <span>Subtotal</span>
                  <span className="dark:text-white">${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] uppercase tracking-widest text-gray-400 font-light pb-6 border-b border-gray-200 dark:border-white/10">
                  <span>Shipping</span>
                  <span className="text-[#77cd3a] italic font-serif">Complimentary</span>
                </div>
                <div className="pt-4 flex justify-between items-end">
                  <span className="text-sm font-light uppercase tracking-[0.3em] dark:text-white/30">Total</span>
                  <span className="text-5xl md:text-6xl font-extralight tracking-tighter dark:text-white">
                    ${total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <motion.button 
                whileTap={{ scale: 0.98 }}
                className="w-full py-5 bg-black dark:bg-[#77cd3a] text-white dark:text-black font-bold rounded-2xl flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                <span className="text-[10px] uppercase tracking-[0.4em] relative z-10">Continue to Checkout</span>
                <ArrowRight size={14} className="relative z-10 group-hover:translate-x-2 transition-transform duration-500" />
              </motion.button>
              
              <Link to="/products" className="w-full py-4 border border-gray-200 dark:border-white/10 text-gray-400 hover:text-black dark:hover:text-white rounded-2xl flex items-center justify-center gap-2 transition-all text-[9px] uppercase tracking-[0.3em] font-bold">
                <ChevronLeft size={12} /> Add more items
              </Link>
            </div>

            <div className="mt-12 p-4 rounded-2xl bg-[#77cd3a]/5 border border-[#77cd3a]/10 flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-[#77cd3a]/10 flex items-center justify-center shrink-0">
                  <Leaf size={16} className="text-[#77cd3a]" />
               </div>
               <p className="text-[9px] text-gray-500 dark:text-white/40 leading-relaxed uppercase tracking-wider">
                  Your order supports <span className="text-[#77cd3a] font-bold">sustainable farming</span> and carbon-neutral delivery.
               </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
};

export default Cart;