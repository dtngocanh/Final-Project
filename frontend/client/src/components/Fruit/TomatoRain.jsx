import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MY_FRUITS_IMAGES = [
  "/cheri2.png", 
  "/greenapple.png", 
  "/melon.png",
];

const SideFloatFruits = () => {
  const [wonVoucher, setWonVoucher] = useState(null);

  const fruits = useMemo(() => {
    return Array.from({ length: 22 }).map((_, i) => {
      const randomImage = MY_FRUITS_IMAGES[Math.floor(Math.random() * MY_FRUITS_IMAGES.length)];

      const depthLayer = Math.floor(Math.random() * 3); 
      
      let size, opacity, blur, duration, zIndex;
      
      if (depthLayer === 0) { // Lớp nền xa
        size = 15 + Math.random() * 15;   // 15px - 30px
        opacity = [0, 0.25, 0.25, 0];
        blur = "blur(4px)";               // Nhòe sâu tạo khoảng cách
        duration = 18 + Math.random() * 10; // Rơi siêu chậm (18s - 28s)
        zIndex = 1;
      } else if (depthLayer === 1) { // Lớp tương tác chính
        size = 35 + Math.random() * 20;   // 35px - 55px
        opacity = [0, 0.6, 0.6, 0];
        blur = "blur(0px)";               // Rõ nét để kích thích click
        duration = 12 + Math.random() * 6;  // Rơi vừa phải (12s - 18s)
        zIndex = 3;
      } else { // Lớp sát màn hình (Tiền cảnh)
        size = 70 + Math.random() * 40;   // 70px - 110px (To hẳn lên)
        opacity = [0, 0.15, 0.15, 0];     // Để mờ tránh che khuất text trên web
        blur = "blur(6px)";               // Nhòe nghệ thuật giống máy ảnh cinematic
        duration = 7 + Math.random() * 4;   // Lướt qua màn hình rất nhanh (7s - 11s)
        zIndex = 5;
      }

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

  const handleClick = (isLucky) => {
    if (isLucky && !wonVoucher) {
      const prize = prizes[Math.floor(Math.random() * prizes.length)];
      setWonVoucher(prize);
    }
  };

  return (
    <div className="fixed inset-0 z-[2] overflow-hidden pointer-events-none">
      {fruits.map((fruit) => (
        <motion.div
          key={fruit.id}
          className="absolute"
          style={{
            left: `${fruit.left}vw`,
            top: "-15vh",
            width: `${fruit.size}px`,
            height: `${fruit.size}px`,
            zIndex: fruit.zIndex,
            // Áp dụng hiệu ứng xóa phông (blur) theo tầng
            filter: fruit.blur,
            // Chỉ lớp trung tâm mới cho phép click, lớp xa/gần chỉ làm cảnh để tối ưu UX
            pointerEvents: fruit.depthLayer === 1 ? "auto" : "none"
          }}
          initial={{ y: -100, opacity: 0 }}
          animate={{
            y: "115vh",
            x: [
              `-${fruit.windSwing}px`, 
              `${fruit.windSwing}px`, 
              `-${fruit.windSwing}px`
            ],
            rotate: [0, 180, 360],
            opacity: fruit.opacity
          }}
          transition={{
            duration: fruit.duration,
            delay: fruit.delay,
            repeat: Infinity,
            ease: "linear" // Dùng linear kết hợp x hình sin tạo cảm giác gió tự nhiên hơn
          }}
          // Hiệu ứng phản hồi cao cấp khi lướt chuột qua (chỉ áp dụng quả click được)
          whileHover={fruit.depthLayer === 1 ? {
            scale: 1.2,
            filter: fruit.isLucky 
              ? "drop-shadow(0 0 25px rgba(255,215,0,0.8)) brightness(1.2)"
              : "drop-shadow(0 0 15px rgba(119,205,58,0.6))",
            cursor: "pointer"
          } : {}}
          onClick={() => handleClick(fruit.isLucky)}
        >
          <img 
            src={fruit.image} 
            className="w-full h-full object-contain select-none" 
            alt="premium-floating-fruit" 
          />
          
          {/* Vòng sáng ẩn hiện nhẹ nhàng xung quanh quả may mắn */}
          {fruit.isLucky && (
            <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-md animate-ping pointer-events-none" />
          )}
        </motion.div>
      ))}

      {/* --- Popup Quà Tặng Tối Giản, Sang Trọng --- */}
      <AnimatePresence>
        {wonVoucher && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-[10000] p-6 pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setWonVoucher(null)}
          >
            <motion.div
              className="bg-zinc-950 text-white p-10 rounded-[32px] text-center max-w-sm border border-white/10 relative overflow-hidden"
              style={{ boxShadow: "0 0 50px -10px rgba(119,205,58,0.3)" }}
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-5xl mb-4 animate-bounce">🎁</div>
              <h3 className="text-xl font-bold uppercase tracking-widest mb-1 text-emerald-400">Veganic Reward</h3>
              <p className="text-xs text-zinc-400 mb-6">Mã giảm giá đặc biệt dành riêng cho bạn</p>

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

              <button
                onClick={() => setWonVoucher(null)}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
              >
                Nhận ngay
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SideFloatFruits;