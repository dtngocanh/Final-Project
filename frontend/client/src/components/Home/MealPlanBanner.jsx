import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Apple, Citrus, Leaf } from "lucide-react";

const MealPlanBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 my-12 md:my-20">
      <div 
        className="
          group
          relative 
          w-full 
          min-h-[420px] sm:min-h-[380px] md:min-h-[440px] 
          rounded-[28px] md:rounded-[32px] 
          overflow-hidden 
          bg-gradient-to-br from-white via-[#f4fbf0] to-[#e8f7df]
          dark:from-[#0b130c] dark:via-[#040a05] dark:to-[#020502]
          border border-[#77cd3a]/20 dark:border-[#77cd3a]/10
          flex flex-col lg:flex-row lg:items-center justify-between
          p-6 sm:p-10 md:p-16
          shadow-[0_10px_40px_-12px_rgba(119,205,58,0.12)]
          transition-all duration-500
          hover:border-[#77cd3a]/40
          hover:shadow-[0_20px_50px_-12px_rgba(119,205,58,0.2)]
        "
      >
        {/* LỚP NỀN ẢNH & RAU CỦ TRÔI NỔI */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=1200&q=80" 
            alt="Healthy Veggies" 
            className="w-full h-full object-cover opacity-35 dark:opacity-15 object-center transition-transform duration-1000 ease-out group-hover:scale-105 mix-blend-multiply dark:mix-blend-normal"
          />
          {/* Lớp phủ dải màu chuyển từ Trắng/Xanh nhạt sang trong suốt (Dành cho Desktop) */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#f4fbf0] via-[#f4fbf0]/95 sm:via-[#f4fbf0]/80 to-transparent dark:from-[#040a05] dark:via-[#040a05]/95 dark:to-transparent hidden sm:block" />
          {/* Lớp phủ dải màu (Dành cho Mobile) */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-[#f4fbf0]/90 to-[#e8f7df]/80 dark:from-[#0b130c]/95 dark:to-[#020502] block sm:hidden" />

          {/* RAU CỦ QUẢ BAY TRONG BANNER (Tạo hiệu ứng tươi mát đồng bộ với trang mâm cơm) */}
          <div className="absolute top-10 right-1/3 text-[#77cd3a]/20 group-hover:translate-y-2 group-hover:rotate-12 transition-all duration-700 ease-out pointer-events-none hidden md:block">
            <Apple size={36} strokeWidth={1.5} />
          </div>
          <div className="absolute bottom-12 right-1/4 text-[#77cd3a]/15 group-hover:-translate-y-3 group-hover:-rotate-12 transition-all duration-700 ease-out pointer-events-none hidden md:block">
            <Citrus size={44} strokeWidth={1.5} />
          </div>
        </div>

        {/* NỘI DUNG CHÍNH (CHỮ ĐẬM RÕ RÀNG TRÊN NỀN SÁNG) */}
        <div className="relative z-10 max-w-xl text-left flex-1 flex flex-col justify-center h-full">
          
          {/* MINI GLOWING BADGE */}
          <div className="w-fit inline-flex items-center gap-2 bg-[#77cd3a]/15 dark:bg-[#77cd3a]/20 backdrop-blur-md border border-[#77cd3a]/30 px-3.5 py-1.5 rounded-full mb-5 md:mb-6">
            <Sparkles size={11} className="text-[#62ab2e] dark:text-[#9be45d] animate-pulse" />
            <span className="text-[8px] sm:text-[9px] font-extrabold text-[#62ab2e] dark:text-[#9be45d] uppercase tracking-[0.25em]">
              Exclusive Feature
            </span>
          </div>

          {/* SLOGAN TITLES */}
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-tight text-gray-800 dark:text-white mb-4 leading-[1.2] sm:leading-[1.15]">
            Stuck wondering <br />
            <span className="font-bold bg-gradient-to-r from-[#62ab2e] to-[#77cd3a] dark:from-[#77cd3a] dark:to-[#a3f068] bg-clip-text text-transparent">
              what to eat today?
            </span>
          </h2>

          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm md:text-base font-medium mb-6 md:mb-8 max-w-md leading-relaxed">
            Skip the daily meal-planning stress. Let Veggies guide you with personalized 7-day plant-based challenges, tailor-made to match your lifestyle goals.
          </p>

          {/* CTA BUTTON */}
          <button
            onClick={() => navigate("/meal-plans")}
            className="
              w-full sm:w-fit
              inline-flex items-center justify-center gap-3
              bg-[#77cd3a] 
              hover:bg-[#69b732]
              text-white 
              text-xs md:text-sm
              font-semibold
              uppercase tracking-widest
              px-6 sm:px-8 py-3.5 md:py-4 
              rounded-full
              shadow-lg shadow-[#77cd3a]/20
              hover:shadow-[#77cd3a]/30
              transition-all duration-300
              hover:gap-5
              active:scale-[0.98]
            "
          >
            Start Your Challenge
            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1.5" />
          </button>
        </div>

        {/* PHẦN TRANG TRÍ ĐỘNG PHÍA BÊN PHẢI */}
        <div className="relative hidden lg:flex items-center justify-center w-1/3 min-h-[250px] pointer-events-none select-none z-10">
          {/* Đốm sáng Ambient tỏa ánh xanh rêu nhạt */}
          <div className="absolute w-64 h-64 rounded-full bg-[#77cd3a]/20 blur-3xl transition-all duration-750 group-hover:scale-125" />
          
          {/* Vòng quay họa tiết */}
          <div className="absolute w-48 h-48 border border-dashed border-[#77cd3a]/30 rounded-full animate-[spin_50s_linear_infinite]" />
          <div className="absolute w-36 h-36 border border-dotted border-[#77cd3a]/10 rounded-full animate-[spin_25s_linear_infinite_reverse]" />

          {/* Khối Widget tương tác nổi bật hẳn lên */}
          <div className="relative p-5 bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-[#77cd3a]/20 rounded-[24px] shadow-xl transform transition-all duration-700 group-hover:-translate-y-2 group-hover:rotate-1 group-hover:border-[#77cd3a]/40">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#77cd3a] animate-ping" />
              <span className="text-[9px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-mono font-bold">Day 01 / Active</span>
            </div>
            <div className="text-gray-800 dark:text-white text-xs font-semibold tracking-wide flex items-center gap-1.5">
              Healthy Green Plan <Leaf size={12} className="text-[#77cd3a] animate-bounce" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default MealPlanBanner;