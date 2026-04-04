import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, Sparkles, Cherry, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { resetPassword } from "../store/slices/authSlice";
import FloatingVegetables from "../components/Fruit/FloatingVegetables";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });

  const handleReset = (e) => {
    e.preventDefault();
    dispatch(resetPassword({ token, ...formData })).then((res) => { 
      if (res.payload?.success) navigate("/login"); 
    });
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#fcfdfd] relative overflow-hidden font-['Fredoka']">
      {/* Lớp rau củ bay nền */}
      <div className="absolute inset-0 z-0">
        <FloatingVegetables activeColor="#77cd3af2" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="relative z-10 w-full max-w-[420px] px-4"
      >
        <div className="bg-white/40 backdrop-blur-2xl rounded-[3.5rem] p-12 border border-white/60 shadow-2xl relative overflow-hidden">
          
          {/* Decor quả Cherry bay trong form tạo chiều sâu */}
          <motion.div 
            animate={{ y: [0, 20, 0], rotate: [-5, 5, -5] }} 
            transition={{ duration: 6, repeat: Infinity }} 
            className="absolute top-10 -right-6 opacity-[0.08] pointer-events-none"
          >
             <Cherry size={68} className="text-[#77cd3af2]" />
          </motion.div>

          <div className="text-center mb-10 relative z-10">
            <h2 className="text-3xl font-normal text-[#1a2e35]">
              New <span className="font-serif italic text-[#77cd3af2] text-4xl underline decoration-wavy decoration-[#77cd3af2]/20 underline-offset-8">Seed</span>
            </h2>
            <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-[0.2em]">Fresh start, fresh security</p>
          </div>

          <form onSubmit={handleReset} className="space-y-7 relative z-10">
            {/* New Password Field */}
            <div className="relative group border-b border-slate-200 focus-within:border-[#77cd3af2] transition-all duration-500">
              <div className="absolute inset-y-0 left-0 flex items-center text-[#77cd3af2] opacity-40 group-focus-within:opacity-100">
                <Lock size={18} strokeWidth={1.5} />
              </div>
              <input 
                type={showPass ? "text" : "password"} 
                required 
                placeholder="New Password" 
                className="w-full bg-transparent py-4 pl-8 pr-10 outline-none text-lg leading-none placeholder:text-slate-300" 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  className="text-slate-400 hover:text-[#77cd3af2] transition-colors p-1"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="relative group border-b border-slate-200 focus-within:border-[#77cd3af2] transition-all duration-500">
              <div className="absolute inset-y-0 left-0 flex items-center text-[#77cd3af2] opacity-40 group-focus-within:opacity-100">
                <Lock size={18} strokeWidth={1.5} />
              </div>
              <input 
                type={showConfirm ? "text" : "password"} 
                required 
                placeholder="Confirm Password" 
                className="w-full bg-transparent py-4 pl-8 pr-10 outline-none text-lg leading-none placeholder:text-slate-300" 
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button 
                  type="button" 
                  onClick={() => setShowConfirm(!showConfirm)} 
                  className="text-slate-400 hover:text-[#77cd3af2] transition-colors p-1"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-4 flex flex-col items-center gap-6">
              <button 
                disabled={loading} 
                className="w-full py-4.5 bg-[#025c37] text-white rounded-[2rem] font-bold uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#77cd3af2] hover:text-[#025c37] transition-all active:scale-95 shadow-lg shadow-emerald-900/10 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    <span>Update Security</span>
                  </>
                )}
              </button>
              
              <button 
                type="button"
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 hover:text-[#1a2e35] transition-colors tracking-widest"
              >
                <ArrowLeft size={12} /> Return to Login
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;