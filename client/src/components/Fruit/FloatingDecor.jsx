import React from "react";
import { motion } from "framer-motion";
import { Carrot, Citrus, Cherry, Salad, Leaf } from "lucide-react";

const FloatingDecor = () => {
  const decorItems = [
    { Icon: Carrot, size: 100, top: "10%", left: "5%", rotate: 15, delay: 0 },
    { Icon: Citrus, size: 140, top: "60%", left: "2%", rotate: -20, delay: 2 },
    { Icon: Cherry, size: 80, bottom: "15%", right: "35%", rotate: 45, delay: 1 },
    { Icon: Salad, size: 120, top: "20%", right: "5%", rotate: -10, delay: 3 },
    { Icon: Leaf, size: 90, bottom: "10%", left: "40%", rotate: 30, delay: 4 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Hiệu ứng đổ bóng Blur nền */}
      <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] bg-[#77cd3a]/10 dark:bg-[#77cd3a]/5 blur-[130px] rounded-full" />
      
      {decorItems.map((item, index) => (
        <motion.div
          key={index}
          className="absolute hidden xl:block opacity-[0.08] dark:opacity-[0.04]"
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            bottom: item.bottom,
          }}
          animate={{
            y: [0, 30, 0],
            rotate: [item.rotate, item.rotate + 15, item.rotate],
          }}
          transition={{
            duration: 10 + index * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: item.delay,
          }}
        >
          <item.Icon size={item.size} strokeWidth={0.5} className="text-[#77cd3a]" />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingDecor;