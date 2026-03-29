import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Leaf, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { updateCartQuantity, removeFromCart } from "../store/slices/cartSlice";

// Import hiệu ứng hoa quả ở đây
import FloatingDecor from "../components/Fruit/FloatingDecor";

const Cart = () => {
  const dispatch = useDispatch();
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
    <main className="h-screen pt-20 overflow-hidden bg-white dark:bg-[#060606] flex flex-col relative transition-colors duration-700">
      <FloatingDecor />

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full overflow-hidden">
        {/* BÊN TRÁI: DANH SÁCH ITEM */}
        <div className="lg:w-[60%] flex flex-col p-6 md:p-12 overflow-hidden border-r border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-4xl md:text-5xl font-extralight tracking-tighter dark:text-white">
              My <span className="font-serif italic border-b-2 border-[#77cd3af2]/30">cart</span>
            </h2>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-[0.2em] bg-gray-50 dark:bg-white/5 px-4 py-1.5 rounded-full border border-gray-100 dark:border-white/10">
              {cartItemsCount} Items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => (
                <motion.div key={item.product._id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="flex gap-6 py-8 border-b border-gray-100 dark:border-white/[0.04] group relative">
                  {/* ... Render Item Image & Info ... */}
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 dark:bg-white/[0.02] rounded-[32px] overflow-hidden p-5 flex-shrink-0 border border-gray-100 dark:border-white/5">
                    <img src={item.product.images?.[0]?.url} className="w-full h-full object-contain" alt="" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base md:text-lg font-light tracking-tight dark:text-white uppercase">{item.product.name}</h3>
                        <p className="text-[10px] text-gray-400 font-mono mt-1 italic tracking-widest uppercase">Certified Organic • ${item.product.price}</p>
                      </div>
                      <button onClick={() => dispatch(removeFromCart({ id: item.product._id }))} className="p-2 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 duration-300">
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-5 bg-white dark:bg-black/40 px-4 py-2 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
                        <button onClick={() => updateQuantity(item.product._id, item.quantity, -1)} className="text-gray-400 hover:text-[#77cd3a]"><Minus size={14} /></button>
                        <span className="text-xs font-mono font-bold dark:text-white w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product._id, item.quantity, 1)} className="text-gray-400 hover:text-[#77cd3a]"><Plus size={14} /></button>
                      </div>
                      <span className="text-2xl font-light tracking-tighter dark:text-white">${(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* BÊN PHẢI: TỔNG TIỀN & NÚT BẤM (GIỮ NGUYÊN LOGIC AUTH) */}
        <div className="lg:w-[40%] bg-gray-50/30 dark:bg-white/[0.01] backdrop-blur-xl p-6 md:p-12 flex flex-col justify-center relative">
          <div className="max-w-md mx-auto w-full relative z-10">
            <div className="space-y-10 mb-12">
              <div className="flex items-center gap-3 text-[#77cd3a]">
                <Leaf size={16} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">Harvest Summary</span>
              </div>
              <div className="space-y-5">
                <div className="flex justify-between text-[11px] uppercase tracking-widest text-gray-400 font-medium">
                  <span>Subtotal</span>
                  <span className="dark:text-white font-mono">${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] uppercase tracking-widest text-gray-400 font-medium font-mono">
                  <span>Shipping Fee</span>
                  <span>$7.00</span>
                </div>
                <div className="pt-6 flex flex-col gap-1 border-t border-gray-200 dark:border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 dark:text-white/20">Estimated Total</span>
                  <span className="text-6xl md:text-7xl font-extralight tracking-tighter dark:text-white leading-none">${(total + 7).toLocaleString()}</span>
                </div>
              </div>
            </div>

          
            <div className="space-y-4">
           
                <Link to="/payment">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-6 bg-black dark:bg-[#77cd3a] text-white dark:text-black font-bold rounded-[24px] flex items-center justify-center gap-4 shadow-2xl shadow-[#77cd3a]/10">
                    <span className="text-[11px] uppercase tracking-[0.4em]">Proceed to Checkout</span>
                    <ArrowRight size={16} />
                  </motion.button>
                </Link>
              <Link to="/products" className="w-full py-4 border border-gray-200 dark:border-white/10 text-gray-400 hover:text-black dark:hover:text-white rounded-2xl flex items-center justify-center gap-3 transition-all text-[9px] uppercase tracking-[0.4em] font-bold">
                <ChevronLeft size={14} /> Add more from garden
              </Link>
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #77cd3a33; border-radius: 10px; }` }} />
    </main>
  );
};

export default Cart;