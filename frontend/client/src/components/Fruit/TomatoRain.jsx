import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Định nghĩa danh sách các loại trái cây má muốn dùng
const MY_FRUITS_IMAGES = [
  "/mango.png",   // Xoài
  "/cheri1.png", 
  "/meat.png" ,// Cherry
 
];

const SideFloatFruits = () => {
  const [wonVoucher, setWonVoucher] = useState(null);

  // 🍑 Tạo nhiều trái cây random với hiệu ứng lãng mạn
  const fruits = useMemo(() => {
    // Tăng số lượng lên 20 quả cho nó "mưa"
    return Array.from({ length: 20 }).map((_, i) => {
      // Chọn ngẫu nhiên 1 loại quả trong danh sách
      const randomImage = MY_FRUITS_IMAGES[Math.floor(Math.random() * MY_FRUITS_IMAGES.length)];
      
      return {
        id: i,
        image: randomImage,
        left: Math.random() * 100, // Vị trí ngang ngẫu nhiên
        delay: Math.random() * 10, // Delay xuất hiện ngẫu nhiên (tăng lên cho thoáng)
        duration: 8 + Math.random() * 8, // Tốc độ rơi chậm hơn cho lãng mạn (8s - 16s)
        size: 30 + Math.random() * 20, // Kích thước ngẫu nhiên (30px - 50px)
        
        // Hiệu ứng "gió thổi" lãng mạn: đung đưa sang trái phải
        windSwing: 15 + Math.random() * 15, // Độ đung đưa ngẫu nhiên (15px - 30px)
        
        isLucky: i === 7 // Quả số 7 là quả may mắn (mã may mắn của Veggies)
      };
    });
  }, []);

  const prizes = [
    { code: "Veggies_CUTIE", desc: "Voucher 20% OFF" },
    { code: "SHIP_THUAN_MAT", desc: "Free Shipping" },
    { code: "MON_QUA_NHO", desc: "Voucher 50k" },
    { code: "HAPPY_VEGAN", desc: "Chúc bạn 1 ngày vui vẻ 😆" }
  ];

  const handleClick = (isLucky, product) => {
    // Chỉ cho trúng quà 1 lần
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
          className="absolute pointer-events-auto cursor-pointer group"
          style={{
            left: `${fruit.left}vw`,
            top: "-15vh", // Xuất phát từ trên cao hơn một chút
            width: `${fruit.size}px`,
            height: `${fruit.size}px`,
          }}
          initial={{ y: -100, opacity: 0 }}
          animate={{
            y: "115vh", // Rơi xuyên màn hình
            
            // --- Hiệu ứng lãng mạn đung đưa ---
            x: [
              `-${fruit.windSwing}px`, 
              `${fruit. windSwing}px`, 
              `-${fruit.windSwing}px`
            ], 
            // ---------------------------------
            
            rotate: [0, 90, 180, 270, 360], // Xoay nhẹ nhàng khi rơi
            
            // Hiệu ứng mờ dần khi gần chạm đáy
            opacity: [0.1, 0.4, 0.4, 0] 
          }}
          transition={{
            duration: fruit.duration,
            delay: fruit.delay,
            repeat: Infinity,
            ease: "easeInOut" // EaseInOut cho cảm giác đung đưa nhẹ nhàng hơn Linear
          }}
          
          // Hiệu ứng Hover Bloom nhẹ nhàng, sang chảnh
          whileHover={{
            scale: 1.25,
            opacity: 1,
            // Bloom (glow) màu xanh lá thương hiệu cho quả thường, vàng gold cho quả lucky
            filter: fruit.isLucky
              ? "drop-shadow(0 0 15px rgba(255, 215, 0, 0.7))"
              : "drop-shadow(0 0 10px rgba(119, 205, 58, 0.6))",
            transition: { duration: 0.3 }
          }}
          onClick={() => handleClick(fruit.isLucky, fruit)}
        >
          {/* Ảnh trái cây thật của má */}
          <img 
            src={fruit.image} 
            className="w-full h-full object-contain filter group-hover:drop-shadow-sm transition-all duration-300" 
            alt="floating-fruit" 
          />
        </motion.div>
      ))}

      {/* --- 🎁 Popup Nhận Quà Xịn Hơn --- */}
      <AnimatePresence>
        {wonVoucher && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xl z-[10000] p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setWonVoucher(null)}
          >
            <motion.div
              className="bg-white dark:bg-[#111111] p-10 rounded-[32px] text-center shadow-2xl max-w-sm border border-gray-100 dark:border-white/5 relative overflow-hidden"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 100, damping: 15 }}
              onClick={(e) => e.stopPropagation()} // Chặn click popup tắt popup
            >
              {/* Decor background cực nhẹ cho popup */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#77cd3a]/5 via-transparent to-transparent opacity-50" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="text-6xl mb-6">🍑✨</div>
                <h3 className="text-xl md:text-2xl font-black mb-2 text-gray-950 dark:text-white tracking-tighter uppercase">Veggies Magic!</h3>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-6">Bạn đã săn được một món quà nhỏ</p>

                <div className="w-full p-4 bg-gray-50 dark:bg-black/20 rounded-2xl mb-8 border border-gray-100 dark:border-white/5">
                  <span className="font-sans text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-1">{wonVoucher.desc}</span>
                  <span className="font-mono text-lg font-black tracking-widest text-[#77cd3a] block">{wonVoucher.code}</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setWonVoucher(null)}
                  className="px-12 py-3.5 bg-[#77cd3a] text-black font-bold rounded-full text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-[#77cd3a]/20"
                >
                  OK
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SideFloatFruits;