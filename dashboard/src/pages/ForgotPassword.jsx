import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, Loader2, Send } from "lucide-react";
import { forgotPassword } from "../store/slices/authSlice";

const ForgotPassword = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(forgotPassword({ email })).then(() => {
        // Có thể thêm logic thông báo thành công ở đây
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-['Fredoka']">
          {/* Overlay làm mờ nền */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#fcfdfd]/60 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[400px] bg-white/80 backdrop-blur-2xl rounded-[3rem] p-10 border border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)]"
          >
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-[#77cd3af2]/10 rounded-full">
                  <Mail size={32} className="text-[#77cd3af2]" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-[#1a2e35]">Lost your way?</h3>
              <p className="text-sm text-slate-400 mt-2 font-serif italic">
                Enter your email to recover your <span className="text-[#77cd3af2]">green path</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your register email"
                  className="w-full bg-transparent border-b border-slate-200 py-3 text-lg font-medium text-center outline-none focus:border-[#77cd3af2] transition-all placeholder:text-slate-200"
                />
              </div>

              <div className="flex flex-col gap-4">
                <button
                  disabled={loading}
                  className="w-full py-4 bg-[#025c37] text-white rounded-[2rem] font-bold text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#77cd3af2] hover:text-[#025c37] transition-all shadow-lg shadow-green-100 disabled:opacity-50"
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
                  className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#1a2e35] transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to Login
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ForgotPassword;