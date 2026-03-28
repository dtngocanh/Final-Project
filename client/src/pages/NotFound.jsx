import { Link } from "react-router-dom";
import {
  Home,
  ArrowLeft,
  Leaf,
  Carrot,
  Salad,
  Citrus,
  Cherry,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";

const NotFound = () => {
  const { theme } = useTheme();
  const activeColor = theme === "dark" ? "#77cd3af2" : "#025c37";

  const vegies = [
    { Icon: Carrot, size: 120, top: "15%", left: "10%", delay: 0, rotate: 30 },
    {
      Icon: Salad,
      size: 160,
      bottom: "20%",
      left: "15%",
      delay: 2,
      rotate: -15,
    },
    { Icon: Citrus, size: 100, top: "25%", right: "12%", delay: 4, rotate: 45 },
    {
      Icon: Cherry,
      size: 80,
      bottom: "25%",
      right: "20%",
      delay: 1,
      rotate: -20,
    },
    { Icon: Leaf, size: 140, top: "50%", left: "45%", delay: 3, rotate: 10 },
  ];

  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-6 overflow-hidden transition-colors duration-500">
      {/* BACKGROUND DECOR */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#77cd3af2]/10 blur-[140px] rounded-full" />

        {vegies.map((item, index) => (
          <motion.div
            key={index}
            style={{
              position: "absolute",
              top: item.top,
              left: item.left,
              right: item.right,
              bottom: item.bottom,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 20, 0],
              rotate: [item.rotate, item.rotate + 20, item.rotate],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 15 + index * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item.delay,
            }}
          >
            <item.Icon
              size={item.size}
              strokeWidth={0.5}
              style={{ color: activeColor }}
            />
          </motion.div>
        ))}
      </div>

      {/* CONTENT CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center max-w-lg bg-white/20 dark:bg-gray-900/20 backdrop-blur-2xl p-10 md:p-16 rounded-[4rem] border border-white/30 dark:border-white/5 shadow-2xl"
      >
        <div className="mb-10">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block mb-4"
          >
            {/* <Leaf size={48} style={{ color: activeColor }} strokeWidth={1} /> */}
            <img
              src="/hahahaha.png"
              alt=""
              style={{ color: activeColor }}
              strokeWidth={1}
            />
          </motion.div>

          <h1 className="text-7xl md:text-8xl font-light tracking-[0.2em] text-gray-900 dark:text-white leading-none mb-6 opacity-10">
            404
          </h1>

          <h2 className="text-3xl md:text-4xl font-light tracking-tight text-gray-800 dark:text-gray-100 mb-6">
            Lost in the{" "}
            <span className="font-serif italic text-[#77cd3af2]">Garden?</span>
          </h2>

          <p className="text-lg text-gray-500 dark:text-gray-400 font-light italic max-w-xs mx-auto leading-relaxed">
            Oops! It seems this sprout hasn't grown yet or has been moved to
            another field.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="group flex items-center justify-center space-x-2 px-8 py-3.5 bg-[#77cd3af2] text-white rounded-2xl font-bold tracking-widest uppercase text-[10px] shadow-lg shadow-[#77cd3af2]/30 hover:opacity-90 transition-all duration-300"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center space-x-2 px-8 py-3.5 bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 backdrop-blur-md rounded-2xl font-bold tracking-widest uppercase text-[10px] border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </motion.div>

      <div className="absolute bottom-10 text-center w-full opacity-30">
        <p className="text-[9px] uppercase tracking-[0.4em] dark:text-gray-500 font-medium">
          Veganic Sanctuary • 2026
        </p>
      </div>
    </div>
  );
};

export default NotFound;
