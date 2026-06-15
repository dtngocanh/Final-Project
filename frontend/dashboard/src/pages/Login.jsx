import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Loader2,
  Mail,
  Sprout,
  Eye,
  EyeOff,
  Carrot,
  Leaf,
  Salad,
  Citrus,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { login } from "../store/slices/authSlice";
import FloatingVegetables from "../components/Fruit/FloatingVegetables";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { isAuthenticated, isLoggingIn } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  if (isAuthenticated) return <Navigate to="/" />;

  const brandColor = "#77cd3af2";
  const ultraThinStroke = 0.9;

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#fcfdfd] relative overflow-hidden font-['Fredoka']">
      <div className="absolute inset-0 z-0">
        <FloatingVegetables activeColor={brandColor} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[440px] px-4"
      >
        <div className="bg-white/40 backdrop-blur-2xl rounded-[3.5rem] p-10 md:p-12 border border-white/60 shadow-2xl relative overflow-hidden">
          {/* Decor rau củ bay mờ */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: 10 }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute -top-4 -right-2 opacity-[0.08] pointer-events-none"
          >
            <Carrot
              size={80}
              strokeWidth={ultraThinStroke}
              color={brandColor}
            />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[40%] -left-6 opacity-[0.05] pointer-events-none"
          >
            <Citrus
              size={110}
              strokeWidth={ultraThinStroke}
              color={brandColor}
            />
          </motion.div>

          <div className="text-center mb-10 relative z-20">
            {/* Logo & Brand Name */}
            <div className="flex items-center justify-center gap-2 mb-2 opacity-80">
              <img
                src="/hahahaha.png"
                alt="logo"
                className="w-6 h-6 object-contain"
              />
              <span className="uppercase tracking-[0.4em] text-[11px] font-bold text-[#025c37]">
                Veggies Mart
              </span>
            </div>

            {/* Seller Portal Badge */}
            <div className="inline-flex items-center gap-1.5 bg-[#025c37]/5 px-3 py-1 rounded-full mb-6">
              <ShieldCheck size={12} className="text-[#025c37]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#025c37]">
                Seller Portal
              </span>
            </div>

            <h2 className="text-4xl font-normal text-[#1a2e35] leading-tight">
              Welcome{" "}
              <span className="font-serif italic text-[#77cd3af2] text-3xl underline decoration-wavy decoration-[#77cd3af2]/30 underline-offset-8">
                Back
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-4 font-medium tracking-wide">
              Manage your organic store with ease
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7 relative z-20">
            {/* Email Field */}
            <div className="relative group border-b border-slate-200 focus-within:border-[#77cd3af2] transition-all duration-500">
              <div className="absolute inset-y-0 left-0 flex items-center text-[#77cd3af2] opacity-40 group-focus-within:opacity-100">
                <Mail size={19} strokeWidth={ultraThinStroke} />
              </div>
              <input
                type="email"
                required
                placeholder="Seller Email"
                className="w-full bg-transparent py-4 pl-9 text-lg font-medium outline-none placeholder:text-slate-300 leading-none"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            {/* Password Field */}
            <div className="relative group border-b border-slate-200 focus-within:border-[#77cd3af2] transition-all duration-500">
              <div className="absolute inset-y-0 left-0 flex items-center text-[#77cd3af2] opacity-40 group-focus-within:opacity-100">
                <Sprout size={19} strokeWidth={ultraThinStroke} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                className="w-full bg-transparent py-4 pl-9 pr-10 text-lg font-medium outline-none placeholder:text-slate-300 leading-none"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-[#77cd3af2] transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff size={16} strokeWidth={1.2} />
                  ) : (
                    <Eye size={16} strokeWidth={1.2} />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-4 flex flex-col items-center gap-6 relative z-10">
              <button
                disabled={isLoggingIn}
                className="w-full group relative flex items-center justify-center gap-3 bg-[#025c37] text-white py-4.5 rounded-[2rem] font-bold text-[12px] uppercase tracking-[0.2em] transition-all duration-500 hover:bg-[#77cd3af2] hover:text-[#025c37] active:scale-95 shadow-lg shadow-emerald-900/10 disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <Loader2
                    className="animate-spin"
                    size={20}
                    strokeWidth={1.5}
                  />
                ) : (
                  <>
                    <span>Access Dashboard</span>
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
              <Link
                to="/password/forgot"
                className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] hover:text-[#77cd3af2] transition-colors"
              >
                Lost your green path?
              </Link>
            </div>
          </form>

          {/* Footer Decor */}
          <div className="mt-12 text-center opacity-20 border-t border-slate-200/50 pt-8 flex justify-center gap-4 relative z-20">
            <Carrot
              size={16}
              strokeWidth={ultraThinStroke}
              color={brandColor}
            />
            <Leaf size={16} strokeWidth={ultraThinStroke} color={brandColor} />
            <Salad size={16} strokeWidth={ultraThinStroke} color={brandColor} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
