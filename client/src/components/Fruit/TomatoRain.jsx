import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 🍅 Tomato SVG cute
const TomatoSVG = () => (
  <svg viewBox="0 0 100 100">
    {/* lá */}
    <path d="M50 15 L60 30 L40 30 Z" fill="#4C8C4C"/>
    <path d="M50 15 C40 10,30 20,35 30" stroke="#4C8C4C" strokeWidth="4" fill="none"/>
    <path d="M50 15 C60 10,70 20,65 30" stroke="#4C8C4C" strokeWidth="4" fill="none"/>

    {/* quả */}
    <circle cx="50" cy="55" r="25" fill="#ff4d4f"/>

    {/* highlight */}
    <circle cx="40" cy="45" r="6" fill="white" opacity="0.4"/>
  </svg>
);

const SideFloatFruits = () => {
  const [wonVoucher, setWonVoucher] = useState(null);

  // 🍅 tạo nhiều cà chua random
  const fruits = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 6 + Math.random() * 6, // tốc độ rơi khác nhau
      isLucky: i === 3 // 1 quả may mắn
    }));
  }, []);

  const prizes = [
    "Voucher 20% OFF: VEGANIC_CUTIE",
    "Free Shipping: SHIP_THUAN_MAT",
    "Voucher 50k: MON_QUA_NHO",
    "Chúc bạn 1 ngày vui vẻ 😆"
  ];

  const handleClick = (isLucky) => {
    if (isLucky && !wonVoucher) {
      const prize = prizes[Math.floor(Math.random() * prizes.length)];
      setWonVoucher(prize);
    }
  };

  return (
    <div className="fixed inset-0 z-[1] overflow-hidden pointer-events-none">
      {fruits.map((fruit) => (
        <motion.div
          key={fruit.id}
          className="absolute w-8 h-8 md:w-10 md:h-10 pointer-events-auto cursor-pointer"
          style={{
            left: `${fruit.left}vw`,
            top: "-10vh"
          }}
          initial={{ y: -100, opacity: 0 }}
          animate={{
            y: "110vh", // rơi xuyên màn
            rotate: [0, 180, 360],
            opacity: [0.3, 0.6, 0.6, 0.3]
          }}
          transition={{
            duration: fruit.duration,
            delay: fruit.delay,
            repeat: Infinity,
            ease: "linear"
          }}
          whileHover={{
            scale: 1.3,
            opacity: 1,
            filter: fruit.isLucky
              ? "drop-shadow(0 0 12px gold)"
              : "drop-shadow(0 0 6px red)"
          }}
          onClick={() => handleClick(fruit.isLucky)}
        >
          <TomatoSVG />
        </motion.div>
      ))}

      {/* 🎁 Popup */}
      <AnimatePresence>
        {wonVoucher && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[10000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setWonVoucher(null)}
          >
            <motion.div
              className="bg-white p-8 rounded-2xl text-center shadow-xl max-w-sm"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-5xl mb-4">🍅✨</div>
              <h3 className="text-lg font-bold mb-2">Bạn trúng quà!</h3>

              <div className="p-3 bg-gray-100 rounded-lg mb-4">
                <span className="font-mono">{wonVoucher}</span>
              </div>

              <button
                onClick={() => setWonVoucher(null)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SideFloatFruits;