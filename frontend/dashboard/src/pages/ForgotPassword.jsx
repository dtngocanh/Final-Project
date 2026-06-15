import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Send, ArrowLeft, Mail, Loader2, Citrus } from "lucide-react";
import { motion } from "framer-motion";
import { forgotPassword } from "../store/slices/authSlice";
import FloatingVegetables from "../components/Fruit/FloatingVegetables";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Định nghĩa nét siêu siêu mảnh (0.8 - 1.0)
  const ultraThinStroke = 0.9; 

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    dispatch(forgotPassword({ email }));
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#fcfdfd] relative overflow-hidden font-['Fredoka']">
      
      {/* Background Rau củ trôi nổi (Nét mảnh, mờ) */}
      <div className="absolute inset-0 z-0">
        <FloatingVegetables activeColor="#77cd3af2" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        className="relative z-10 w-full max-w-[420px] px-4"
      >
        <div className="bg-white/40 backdrop-blur-2xl rounded-[3.5rem] p-12 border border-white/60 shadow-xl relative overflow-hidden text-center">
          
          {/* SỬA TẠI ĐÂY: Decor chanh bay xoay tròn - Nét 0.9, Size 110 (Mảnh hơn) */}
          <motion.div 
            animate={{ rotate: -360 }} 
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }} 
            className="absolute -bottom-10 -left-10 opacity-[0.06] pointer-events-none"
          >
             <Citrus size={110} strokeWidth={ultraThinStroke} className="text-[#77cd3af2]" />
          </motion.div>

          <div className="text-center mb-10 relative z-20">
            <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
                <img src="/hahahaha.png" alt="logo" className="w-5 h-5 object-contain" />
                <span className="uppercase tracking-[0.4em] text-[10px] font-bold text-[#025c37]">Veggies Mart</span>
            </div>
            
            <h2 className="text-3xl font-normal text-[#1a2e35]">
              Recover <span className="font-serif italic text-[#77cd3af2] text-4xl underline decoration-wavy decoration-[#77cd3af2]/20 underline-offset-8">Path</span>
            </h2>
            <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-[0.2em]">Seeds never get lost</p>
          </div>
          
          <form onSubmit={handleForgotSubmit} className="space-y-8 relative z-20">
            {/* Input Email - Nét Sprout 0.9, pl-8 -> pl-9 (dãn ra tí) */}
            <div className="relative group border-b border-slate-200 focus-within:border-[#77cd3af2] transition-all duration-500">
              <div className="absolute inset-y-0 left-0 flex items-center text-[#77cd3af2] opacity-40 group-focus-within:opacity-100">
                <Mail size={18} strokeWidth={ultraThinStroke} />
              </div>
              <input 
                type="email" required placeholder="Registered email" 
                className="w-full bg-transparent py-4 pl-9 text-lg font-medium outline-none placeholder:text-slate-300 leading-none" 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            {/* Button Send Link - Nét Send 1.0 */}
            <button disabled={loading} className="w-full py-4.5 bg-[#025c37] text-white rounded-[2rem] font-bold uppercase text-[12px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#77cd3af2] hover:text-[#025c37] active:scale-95 transition-all shadow-lg shadow-emerald-900/10 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                    <span>Send Link</span>
                    <Send size={16} strokeWidth={1.0} />
                </>
              )}
            </button>

            {/* Back Link - strokeWidth 1.0 */}
            <Link to="/login" className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase text-slate-400 hover:text-[#1a2e35] transition-colors tracking-widest">
              <ArrowLeft size={14} strokeWidth={ultraThinStroke}/> Back to Login
            </Link>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;