import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Pure",
    serifTitle: "Organic",
    slideNum: "01",
    description: "Cold-pressed essence from sun-drenched Mediterranean groves.",
    productImg: "/cabage.png",
    bgLight: "linear-gradient(135deg, #fdfcfb 0%, #f4f9f0 100%)",
    bgDark: "radial-gradient(circle at 50% 50%, #232b1d 0%, #212020 100%)",
    accent: "#77cd3a",
    decors: [
      { img: "/kale.png", t: "10%", l: "15%", s: 50 },
      { img: "/xalach.png", b: "10%", r: "15%", s: 90 },
      { img: "/broli.png", t: "50%", l: "5%", s: 40, blur: "1px" },
    ],
  },
  {
    id: 2,
    title: "Wild",
    serifTitle: "Berries",
    slideNum: "02",
    description: "A burst of antioxidants gathered from deep misty mountains.",
    productImg: "/staw.png",
    bgLight: "linear-gradient(135deg, #fff5f5 0%, #fff0f6 100%)",
    bgDark: "linear-gradient(135deg, #21171a 0%, #1a1010 100%)",
    accent: "#ff4d6d",
    decors: [
      { img: "/berry.png", t: "8%", r: "20%", s: 60 },
      {
        img: "https://pngimg.com/d/strawberry_PNG2598.png",
        b: "8%",
        l: "12%",
        s: 55,
      },
      { img: "/cheri1.png", t: "45%", l: "12%", s: 40 },
      { img: "/cheri2.png", t: "10%", r: "70%", s: 80 },
      { img: "/cheri2.png", b: "10%", l: "70%", s: 40 },
      { img: "/cheri1.png", b: "40%", r: "-10%", s: 70 },
    ],
  },
  {
    id: 3,
    title: "Citrus",
    serifTitle: "Energy",
    slideNum: "03",
    description:
      "Pure sunshine in a bottle, designed to revitalize your ritual.",
    productImg: "/123orange.png",
    bgLight: "linear-gradient(135deg, #fff9e6 0%, #fff4cc 100%)",
    bgDark: "linear-gradient(135deg, #252114 0%, #271a1a 100%)",
    accent: "#f9a825",
    decors: [
      { img: "/quat.png", t: "10%", l: "12%", s: 70 },
      { img: "/slice.png", b: "10%", r: "12%", s: 80 },
      { img: "/mango.png", t: "50%", l: "5%", s: 60 },
    ],
  },
];

const InteractiveFruit = ({ item, mousePos, index }) => {
  const [isClicked, setIsClicked] = useState(false);
  const handlePop = () => {
    if (isClicked) return;
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 800);
  };

  return (
    <motion.div
      className="absolute z-20 cursor-pointer touch-none select-none"
      style={{
        top: item.t,
        right: item.r,
        bottom: item.b,
        left: item.l,
        filter: item.blur || "none",
      }}
      animate={{
        x: mousePos.x * (index % 2 === 0 ? 0.015 : -0.015),
        y: [0, -10, 0],
      }}
      transition={{
        y: { duration: 4 + index, repeat: Infinity, ease: "easeInOut" },
      }}
      onClick={handlePop}
    >
      <motion.img
        src={item.img}
        className="drop-shadow-lg"
        style={{ width: item.s }}
        animate={
          isClicked
            ? {
                scale: [1, 1.4, 0.8, 1.2, 1],
                y: [0, -50, 10, -5, 0],
                rotate: [0, 15, -15, 0],
              }
            : {}
        }
      />
    </motion.div>
  );
};

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrent((prev) => (prev + 1) % slides.length),
      7000,
    );
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <motion.div
      onMouseMove={(e) =>
        setMousePos({
          x: e.clientX - window.innerWidth / 2,
          y: e.clientY - window.innerHeight / 2,
        })
      }
      className="relative w-full h-[70vh] min-h-[550px] overflow-hidden transition-all duration-1000 my-4 rounded-[2.5rem] mx-auto max-w-[95%] shadow-xl border border-white/20 dark:border-white/5"
      style={{ background: isDark ? slide.bgDark : slide.bgLight }}
    >
      {/* Subtle Glow */}
      <motion.div
        animate={{ backgroundColor: slide.accent }}
        className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full blur-[100px] opacity-10 dark:opacity-20 pointer-events-none"
      />

      {/* Pagination - Dots nhỏ gọn */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col gap-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="group py-2 outline-none"
          >
            <div
              className={`h-[2px] transition-all duration-500 rounded-full ${current === i ? "w-8 bg-slate-800 dark:bg-white" : "w-3 bg-slate-300 dark:bg-slate-700"}`}
            />
          </button>
        ))}
      </div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-16 h-full grid grid-cols-1 lg:grid-cols-2 items-center relative z-10 py-8 lg:py-0">
        {/* TEXT CONTENT */}
        <div className="order-2 lg:order-1 text-center lg:text-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="inline-block px-3 py-1 rounded-full mb-4 backdrop-blur-sm"
                style={{
                  backgroundColor: `${slide.accent}15`,
                  color: slide.accent,
                }}
              >
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase">
                  {slide.slideNum} // Selection
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-slate-900 dark:text-white leading-tight mb-4">
                {slide.title} <br />
                <span
                  className="font-serif italic"
                  style={{ color: slide.accent }}
                >
                  {slide.serifTitle}
                </span>
              </h1>

              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8 max-w-[280px] mx-auto lg:mx-0 leading-relaxed">
                {slide.description}
              </p>

              <Link
                to="/products"
                className="group inline-flex items-center gap-4 bg-white dark:bg-slate-800 px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-800 dark:text-white">
                  Explore
                </span>
                <ArrowRight
                  size={16}
                  className="text-slate-400 group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* IMAGE CONTENT */}
        <div className="order-1 lg:order-2 relative h-[250px] md:h-[350px] lg:h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              className="relative w-full h-full flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.img
                src={slide.productImg}
                className="w-auto h-[220px] md:h-[320px] lg:h-[400px] object-contain z-10 drop-shadow-2xl"
                animate={{ y: [0, -15, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {slide.decors.map((item, i) => (
                <InteractiveFruit
                  key={i}
                  item={item}
                  mousePos={mousePos}
                  index={i}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroSlider;
