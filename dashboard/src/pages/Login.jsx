import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { 
  ArrowRight, Loader2, Sparkles, 
  Bird, Sprout, Mail, ArrowLeft, Send 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { login, forgotPassword } from "../store/slices/authSlice"; // Check lại đường dẫn này nhé
import FloatingVegetables from "../components/Fruit/FloatingVegetables";

// --- COMPONENT POPUP QUÊN MẬT KHẨU ---
const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    dispatch(forgotPassword({ email })).then(() => {
      alert("Link khôi phục đã được gửi vào email của bạn!");
      onClose();
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 font-['Fredoka']">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#fcfdfd]/60 backdrop-blur-md cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[400px] bg-white/80 backdrop-blur-2xl rounded-[3.5rem] p-10 border border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden"
          >
            <div className="text-center mb-8 relative z-10">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-[#77cd3af2]/10 rounded-full animate-bounce">
                  <Mail size={32} className="text-[#77cd3af2]" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-[#1a2e35]">Lost your way?</h3>
              <p className="text-sm text-slate-400 mt-2 font-serif italic leading-relaxed">
                Enter your email to recover your <br/>
                <span className="text-[#77cd3af2] font-bold">green path</span>
              </p>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-8 relative z-10">
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your registered email"
                  className="w-full bg-transparent border-b border-slate-200 py-3 text-lg font-medium text-center outline-none focus:border-[#77cd3af2] transition-all placeholder:text-slate-200"
                />
              </div>

              <div className="flex flex-col gap-4">
                <button
                  disabled={loading}
                  className="w-full py-4.5 bg-[#025c37] text-white rounded-[2rem] font-bold text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#77cd3af2] hover:text-[#025c37] transition-all shadow-lg shadow-green-100 disabled:opacity-50 active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                      <span>Send Recovery Link</span>
                      <Send size={16} />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#1a2e35] transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Login
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- TRANG LOGIN CHÍNH ---
const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  if (isAuthenticated) return <Navigate to="/" />;

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#fcfdfd] relative overflow-hidden font-['Fredoka']">
      
      {/* Background Decor */}
      <FloatingVegetables activeColor="#77cd3af2" />

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-[420px] px-4"
      >
        <div className="bg-white/40 backdrop-blur-2xl rounded-[3.5rem] p-10 md:p-12 border border-white/60 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.05)]">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
                <img src="/hahahaha.png" alt="logo" className="w-5 h-5 object-contain" />
                <span className="uppercase tracking-[0.4em] text-[10px] font-bold text-slate-500">Veganic Mart</span>
            </div>
            <h2 className="text-4xl font-normal text-[#1a2e35] leading-tight tracking-tight">
                Welcome to your <br />
                <span className="font-serif italic text-[#77cd3af2] text-3xl lowercase">
                    fresh garden
                </span>
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-10">
            {/* Email Field */}
            <div className="relative group">
              <motion.div 
                animate={{ y: [0, -3, 0] }} 
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-[#77cd3af2] opacity-50 group-focus-within:opacity-100 transition-all"
              >
                <Bird size={24} strokeWidth={1.5} />
              </motion.div>
              <input
                type="email" name="email" required onChange={handleChange}
                placeholder="seller email"
                className="w-full bg-transparent border-b border-slate-200 py-3 text-lg font-medium text-center outline-none focus:border-[#77cd3af2] transition-all duration-500 placeholder:text-slate-300 placeholder:font-light"
              />
            </div>

            {/* Password Field */}
            <div className="relative group">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }} 
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-[#77cd3af2] opacity-50 group-focus-within:opacity-100 transition-all"
              >
                <Sprout size={24} strokeWidth={1.5} />
              </motion.div>
              <input
                type="password" name="password" required onChange={handleChange}
                placeholder="password"
                className="w-full bg-transparent border-b border-slate-200 py-3 text-lg font-medium text-center outline-none focus:border-[#77cd3af2] transition-all duration-500 placeholder:text-slate-300 placeholder:font-light"
              />
              <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 transition-all duration-500 ${formData.password ? 'opacity-50' : 'opacity-0'}`}>
                <Sparkles size={10} className="text-[#77cd3af2]" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Secure Entry</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col items-center gap-6">
              <button
                disabled={loading}
                className="w-full group relative flex items-center justify-center gap-3 bg-[#025c37] text-white py-4.5 rounded-[2rem] font-bold text-[13px] uppercase tracking-[0.2em] transition-all duration-500 hover:bg-[#77cd3af2] hover:text-[#025c37] hover:shadow-xl hover:shadow-[#77cd3af2]/20 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <span className="font-['Fredoka']">Enter Dashboard</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <button 
                type="button" 
                onClick={() => setIsForgotOpen(true)}
                className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest hover:text-[#77cd3af2] transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-12 text-center opacity-30 border-t border-slate-200/50 pt-8 font-serif italic text-slate-600">
            <p className="text-[12px] tracking-[0.2em]">Seller Portal 2026</p>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Popup */}
      <ForgotPasswordModal 
        isOpen={isForgotOpen} 
        onClose={() => setIsForgotOpen(false)} 
      />
    </div>
  );
};

export default Login;