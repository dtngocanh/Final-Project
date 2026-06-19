import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Snowflake, Carrot, Citrus, Apple } from "lucide-react";

const FridgeBanner = () => {
  const navigate = useNavigate();

  // Cấu hình chuyển động trôi nổi vô tri cho rau củ quả
  const floatAnimation = (delay) => ({
    y: [0, -12, 0],
    rotate: [0, 8, -8, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay,
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
      className="relative w-full rounded-[32px] overflow-hidden bg-gradient-to-br from-[#bfe6c1]/40 via-[#d2f0d4]/20 to-[#a3d9a5]/10 dark:from-[#bfe6c1]/10 dark:via-transparent dark:to-transparent border border-white/40 dark:border-white/5 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl mb-12 group shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_20px_40px_rgba(0,0,0,0.02)]"
    >
      {/* ================= VEGETABLES FLOATING BACKGROUND ================= */}
      {/* Củ cà rốt trôi lơ lửng góc trái */}
      <motion.div 
        animate={floatAnimation(0)}
        className="absolute left-6 top-2 text-orange-500/20 dark:text-orange-500/10 pointer-events-none hidden sm:block"
      >
        <Carrot size={28} strokeWidth={1.5} />
      </motion.div>

      {/* Quả chanh xoay nhẹ góc phải dưới */}
      <motion.div 
        animate={floatAnimation(1.5)}
        className="absolute right-1/3 bottom-3 text-yellow-500/20 dark:text-yellow-500/10 pointer-events-none hidden md:block"
      >
        <Citrus size={24} strokeWidth={1.5} />
      </motion.div>

      {/* Quả táo nhấp nhô góc phải trên nút */}
      <motion.div 
        animate={floatAnimation(0.7)}
        className="absolute right-12 top-3 text-red-500/15 dark:text-red-500/10 pointer-events-none hidden sm:block"
      >
        <Apple size={26} strokeWidth={1.5} />
      </motion.div>

      {/* Luồng sáng ambient màu Mint phía sau tủ lạnh */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#77cd3a]/10 blur-3xl rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-150" />
      
      {/* ================= EDITORIAL CONTENT BLOCK ================= */}
      <div className="flex-1 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-white/5 rounded-full border border-gray-200/50 dark:border-white/10 shadow-sm mb-4">
          <Sparkles size={12} className="text-[#6bb333] animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">
            Bespoke Feature
          </span>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-light tracking-tight text-neutral-900 dark:text-neutral-100 mb-2 leading-tight">
          Smart Kitchen, <span className="font-semibold text-[#66b330]">Virtual Fridge</span> Magic!
        </h2>
        
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xl font-light leading-relaxed">
          Never let your ingredients go to waste again. Toss your leftover veggies, fruits, or proteins into our 3D Mint Pastel Virtual Fridge. Our AI will instantly curate the top 4 perfect recipes tailored just for you!
        </p>
      </div>

      {/* ================= CALL TO ACTION BUTTON ================= */}
      <div className="relative z-10 shrink-0 w-full md:w-auto flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/pantry")}
          className="relative overflow-hidden w-full md:w-auto px-7 py-4 bg-gradient-to-r from-[#92cf95] to-[#77cd3a] text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_6px_0_#5fa363] active:translate-y-1 active:shadow-[0_2px_0_#5fa363] transition-all duration-150 flex items-center justify-center gap-3 group/btn"
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 w-1/2 h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover/btn:animate-[shimmer_0.8s_ease-out]" />
          
          <div className="p-1.5 bg-black/5 rounded-lg">
            <Snowflake size={14} className="animate-[spin_8s_linear_infinite]" />
          </div>
          <span>Open Virtual Fridge</span>
          <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
        </motion.button>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: skewX(-12deg) translateX(300%); }
        }
      `}</style>
    </motion.div>
  );
};

export default FridgeBanner;