import React from "react";
import { motion } from "framer-motion";

const FruitLoader = () => {
  return (
    <div className="w-full h-[300px] flex flex-col items-center justify-center bg-white dark:bg-[#121212] transition-colors duration-500">
      {/* 1. Tomato Icon cực đơn giản */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="mb-6"
      >
        <img src="/tomatorun.gif" alt="Tomato" className="w-12 h-12 object-contain" />
      </motion.div>

      {/* 2. Text "Loading" tinh tế */}
      <div className="flex flex-col items-center gap-2">
        <motion.div 
          className="text-[10px] font-bold tracking-[0.4em] uppercase text-neutral-400 dark:text-neutral-500"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading Product
        </motion.div>
        
        {/* Thanh progress siêu mảnh */}
        <div className="w-20 h-[1px] bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-emerald-500"
            animate={{ width: ["0%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    </div>
  );
};

export default FruitLoader;