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
        left: Math.random() * 100,
        delay: Math.random() * 12,
        duration,
        size,
        opacity,
        blur,
        zIndex,
        depthLayer,
        windSwing: 25 + Math.random() * 25, // Độ lắc lư rộng hơn cho lãng mạn
        isLucky: i === 7 && depthLayer === 1 // Chỉ quả ở tầng trung mới được trúng thưởng
      };
    });
  }, []);

  const prizes = [
    { code: "VEGANIC_AURA", desc: "Voucher Độc Quyền 25% OFF" },
    { code: "FREE_LUXURY_SHIP", desc: "Miễn Phí Vận Chuyển Hỏa Tốc" },
    { code: "GOLDEN_VEGAN", desc: "Voucher Quà Tặng 100k" }
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

              <div className="p-4 bg-zinc-900 border border-white/5 rounded-2xl mb-6 select-all cursor-pointer group">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">{wonVoucher.desc}</span>
                <span className="font-mono text-xl font-black text-white group-hover:text-emerald-400 transition-colors">{wonVoucher.code}</span>
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