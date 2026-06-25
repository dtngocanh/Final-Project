import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, MoveRight } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Pure",
    serifTitle: "Organic",
    slideNum: "01",
    description: "Cold-pressed essence from sun-drenched Mediterranean groves.",
    productImg: "/cabage.png",
    bgLight: "radial-gradient(circle at 50% 50%, #f6fbf3 0%, #ebf5e4 100%)",
    bgDark: "radial-gradient(circle at 50% 50%, #11180c 0%, #040504 100%)",
    accent: "#77cd3a",
    decors: [
      { img: "/kale.png", t: "10%", l: "15%", s: 60, targetX: -40, targetY: -40 },
      { img: "/xalach.png", b: "12%", r: "15%", s: 85, targetX: 50, targetY: 50 },
      { img: "/broli.png", t: "65%", l: "10%", s: 50, targetX: -50, targetY: 30 }
    ],
  },
  {
    id: 2,
    title: "Wild",
    serifTitle: "Berries",
    slideNum: "02",
    description: "A burst of antioxidants gathered from deep misty mountains.",
    productImg: "/staw.png",
    bgLight: "radial-gradient(circle at 50% 50%, #fff0f3 0%, #ffdeee 100%)",
    bgDark: "radial-gradient(circle at 50% 50%, #1e0b0e 0%, #050203 100%)",
    accent: "#ff4d6d",
    decors: [
      { img: "/berry.png", t: "8%", r: "18%", s: 55, targetX: 40, targetY: -40 },
      { img: "/staw.png", b: "10%", l: "15%", s: 50, targetX: -40, targetY: 40 },
      { img: "/cheri1.png", t: "60%", l: "12%", s: 45, targetX: -40, targetY: -10 }
    ],
  },
  {
    id: 3,
    title: "Prime",
    serifTitle: "Cuts",
    slideNum: "03",
    description: "Premium, sustainably sourced cuts rich in protein and flavor.",
    productImg: "/meat123.png",
    bgLight: "radial-gradient(circle at 50% 50%, #fdf5f5 0%, #f5e1e1 100%)",
    bgDark: "radial-gradient(circle at 50% 50%, #240a0c 0%, #060102 100%)",
    accent: "#e63946",
    decors: [
      { img: "/meat.png", t: "12%", r: "16%", s: 60, targetX: 40, targetY: -40 },
      { img: "/bacon.png", b: "14%", l: "14%", s: 45, targetX: -40, targetY: 40 },
      { img: "/chicken.png", t: "65%", l: "12%", s: 45, targetX: -50, targetY: 20 }
    ],
  },
  {
    id: 4,
    title: "Eco",
    serifTitle: "Parcel",
    slideNum: "04",
    description: "Thoughtfully crafted gift packages wrapped in 100% biodegradable materials.",
    productImg: "/bg1.png",
    bgLight: "radial-gradient(circle at 50% 50%, #fbf9f5 0%, #f1ebe1 100%)",
    bgDark: "radial-gradient(circle at 50% 50%, #1a1610 0%, #050403 100%)",
    accent: "#dda15e",
    decors: [
      { img: "/lemon.png", t: "8%", l: "15%", s: 50, targetX: -40, targetY: -40 },
      { img: "/melon.png", b: "12%", r: "18%", s: 60, targetX: 40, targetY: 40 },
      { img: "/milk.png", t: "35%", r: "12%", s: 45, targetX: 50, targetY: 0 }
    ],
  }
];

const fluidTransition = { type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.85 };

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains("dark"));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // TỐI ƯU 1: Fix lỗi re-create interval liên tục bằng cách cô lập dependencies
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  // TỐI ƯU 2: Dùng useMemo đóng băng biến thể animation chữ để tránh re-render sinh rác vùng nhớ
  const textVariants = useMemo(() => ({
    initial: { y: "105%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "-105%", opacity: 0 }
  }), []);

  return (
    <div 
      className="relative w-full h-[60vh] min-h-[520px] lg:h-[65vh] lg:min-h-[520px] overflow-hidden my-4 sm:my-6 rounded-[2.5rem] mx-auto max-w-[96%] shadow-[0_25px_60px_rgba(0,0,0,0.02)] dark:shadow-[0_30px_70px_rgba(0,0,0,0.35)] border border-neutral-200/50 dark:border-neutral-900/30 select-none transform-gpu transition-colors duration-1000"
      style={{ background: isDark ? slide.bgDark : slide.bgLight }}
    >
      {/* SỐ WATERMARK NỀN */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={slide.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: isDark ? 0.18 : 0.12, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute right-6 bottom-0 z-0 pointer-events-none select-none font-black text-[10rem] sm:text-[15rem] lg:text-[20rem] leading-none tracking-tighter transform-gpu font-sanswill-change-transform"
          style={{ color: slide.accent }}
        >
          {slide.slideNum}
        </motion.div>
      </AnimatePresence>

      {/* DOTS ĐIỀU HƯỚNG */}
      <div className="absolute left-6 lg:left-10 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-4">
        {slides.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrent(i)} 
            className="group relative py-2 outline-none cursor-pointer"
          >
            <div 
              className={`h-[5px] rounded-full transition-all duration-500 ${current === i ? "w-10" : "w-3 bg-neutral-300 dark:bg-neutral-800 group-hover:w-6"}`} 
              style={{ backgroundColor: current === i ? slide.accent : undefined }}
            />
          </button>
        ))}
      </div>

      {/* BỐ CỤC CHÍNH */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-24 h-full grid grid-cols-1 lg:grid-cols-12 items-center relative z-10 py-6 lg:py-0">
        
        {/* KHU VỰC CHỮ */}
        <div className="lg:col-span-5 order-2 lg:order-1 text-center lg:text-left relative z-20 mt-4 lg:mt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial="initial"
              animate="animate"
              exit="exit"
              className="will-change-transform"
            >
              {/* Badge nhỏ */}
              <motion.div
                variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } }}
                transition={fluidTransition}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3 backdrop-blur-md bg-neutral-900/5 dark:bg-white/5 border border-neutral-950/10 dark:border-white/10 text-neutral-800 dark:text-neutral-200"
              >
                <Sparkles size={11} className="animate-pulse" style={{ color: slide.accent }} />
                <span className="text-[9px] font-black tracking-[0.25em] uppercase">FRESH CHOICE {slide.slideNum}</span>
              </motion.div>

              {/* TIÊU ĐỀ SẢN PHẨM */}
              <h1 className="text-4xl sm:text-6xl lg:text-[4.5rem] font-extralight tracking-tight text-neutral-950 dark:text-white leading-[0.95] mb-4 overflow-hidden py-1">
                <motion.span 
                  className="block will-change-transform transform-gpu"
                  variants={textVariants}
                  transition={fluidTransition}
                >
                  {slide.title}
                </motion.span>
                <motion.span 
                  className="font-serif italic font-normal block pl-1 will-change-transform transform-gpu" 
                  style={{ color: slide.accent }}
                  variants={textVariants}
                  transition={{ ...fluidTransition, delay: 0.04 }}
                >
                  {slide.serifTitle}
                </motion.span>
              </h1>

              {/* Đoạn mô tả ngắn */}
              <motion.p 
                variants={{ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } }}
                transition={{ ...fluidTransition, delay: 0.08 }}
                className="text-[11px] sm:text-xs lg:text-sm text-neutral-500 dark:text-neutral-400 font-normal mb-6 max-w-[280px] sm:max-w-[350px] mx-auto lg:mx-0 leading-relaxed"
              >
                {slide.description}
              </motion.p>

              {/* Nút bấm hành động */}
              <motion.div 
                variants={{ initial: { opacity: 0, scale: 0.98, y: 10 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, y: -5 } }} 
                transition={{ ...fluidTransition, delay: 0.12 }}
              >
                <Link
                  to="/shop"
                  className="group inline-flex items-center gap-6 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 px-6 py-3 sm:px-8 sm:py-3.5 rounded-full font-bold shadow-md hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                >
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Buy Fresh</span>
                  <div className="w-5 h-5 rounded-full bg-white/10 dark:bg-black/5 flex items-center justify-center group-hover:translate-x-2 transition-transform duration-300">
                    <MoveRight size={13} />
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* KHU VỰC HỒNG TÂM BIẾN HÌNH */}
        <div className="lg:col-span-7 order-1 lg:order-2 relative h-[240px] sm:h-[300px] lg:h-full flex items-center justify-center pointer-events-none z-10">
          <div className="absolute w-full h-full max-w-[500px] max-h-[500px] flex items-center justify-center">
            
            <AnimatePresence mode="popLayout">
              <motion.div
                key={slide.id}
                className="absolute inset-0 flex items-center justify-center transform-gpu layer-3d"
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {/* TỐI ƯU 3: Bật lại transition và chuyển dịch hiệu ứng bồng bềnh sang CSS Pure (class custom-float) */}
                <motion.img
                  src={slide.productImg}
                  className="w-auto h-[160px] sm:h-[220px] lg:h-[380px] object-contain z-10 drop-shadow-[0_25px_45px_rgba(0,0,0,0.05)] dark:drop-shadow-[0_45px_70px_rgba(0,0,0,0.45)] will-change-transform transform-gpu custom-float"
                  variants={{
                    initial: { opacity: 0, scale: 0.75, filter: "blur(4px)" },
                    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
                    exit: { opacity: 0, scale: 1.15, filter: "blur(8px)" } 
                  }}
                  transition={fluidTransition}
                />

                {/* CÁC ẢNH PHỤ VỆ TINH */}
                {slide.decors.map((item, i) => (
                  <motion.div
                    key={i}
                    className="absolute z-20 hidden md:block will-change-transform transform-gpu"
                    style={{ top: item.t, right: item.r, bottom: item.b, left: item.l }}
                    variants={{
                      initial: { opacity: 0, scale: 0.5, x: -item.targetX * 1.2, y: -item.targetY * 1.2 },
                      animate: { opacity: 1, scale: 1, x: 0, y: 0 },
                      exit: { opacity: 0, scale: 0.5, x: item.targetX, y: item.targetY, filter: "blur(2px)" }
                    }}
                    transition={{ ...fluidTransition, delay: i * 0.015 }}
                  >
                    <img
                      src={item.img}
                      className="drop-shadow-2xl custom-float"
                      style={{ width: item.s, animationDelay: `${i * 0.5}s` }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

          </div>
        </div>

      </div>

      {/* TỐI ƯU 4: Chuyển toàn bộ gánh nặng animation bồng bềnh lặp vô tận sang CSS GPU để tránh nghẽn Main-thread */}
      <style>{`
        .layer-3d { transform-style: preserve-3d; backface-visibility: hidden; }
        @keyframes gpuFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .custom-float {
          animation: gpuFloat 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HeroSlider;