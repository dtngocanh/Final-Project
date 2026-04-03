import React from "react";
import { motion } from "framer-motion";
import { 
  Carrot, Salad, Citrus, Cherry, Leaf, 
  ShoppingBag, Truck, Store, Bird, Sprout, 
  Grape, Apple, Flower2, Wind
} from "lucide-react";

const FloatingVegetables = ({ activeColor = "#77cd3af2" }) => {
  // Danh sách icon phong phú hơn: chim, mầm cây, hoa quả...
  const elements = [
    { Icon: Bird, size: 80, top: '8%', left: '5%', delay: 0, rotate: -10 },
    { Icon: Sprout, size: 60, bottom: '15%', right: '15%', delay: 2, rotate: 10 },
    { Icon: Carrot, size: 100, top: '20%', left: '-8%', delay: 1, rotate: 25 },
    { Icon: Salad, size: 140, bottom: '5%', left: '-5%', delay: 4, rotate: -15 },
    { Icon: Citrus, size: 90, top: '15%', right: '10%', delay: 3, rotate: 45 },
    { Icon: Cherry, size: 70, bottom: '25%', right: '-5%', delay: 1.5, rotate: -20 },
    { Icon: Leaf, size: 110, top: '45%', right: '5%', delay: 2.5, rotate: 15 },
    { Icon: Flower2, size: 50, top: '40%', left: '10%', delay: 5, rotate: 0 },
    { Icon: Grape, size: 65, bottom: '40%', left: '15%', delay: 3.5, rotate: -10 },
    { Icon: Apple, size: 55, top: '60%', right: '20%', delay: 2, rotate: 15 },
    { Icon: Wind, size: 120, top: '2%', right: '30%', delay: 6, rotate: 0, opacity: 0.05 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#fcfdfd]">
      
      {/* 1. HIỆU ỨNG LOANG MÀU (MULTI-LAYER GRADIENT BLUR) */}
      {/* Khối xanh lá chủ đạo */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#77cd3a]/20 rounded-full blur-[140px] mix-blend-multiply animate-pulse" />
      
      {/* Khối xanh ngọc bích (Teal) */}
      <div className="absolute bottom-[-20%] left-[10%] w-[60%] h-[60%] bg-emerald-200/30 rounded-full blur-[120px] mix-blend-multiply" />
      
      {/* Khối xanh dương nhạt (Sky) */}
      <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[130px] mix-blend-screen" />
      
      {/* Khối vàng cam (Citrus) tạo điểm ấm */}
      <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-orange-100/30 rounded-full blur-[100px] mix-blend-multiply" />
      
      {/* Khối tím nhạt (Berry) ẩn hiện */}
      <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-purple-50/40 rounded-full blur-[110px]" />

      {/* 2. CÁC ICON TRÔI NỔI */}
      {elements.map((item, index) => (
        <motion.div
          key={index}
          style={{ 
            position: 'absolute', 
            top: item.top, 
            left: item.left, 
            right: item.right, 
            bottom: item.bottom 
          }}
          animate={{ 
            y: [0, 30, 0],
            x: [0, 15, 0],
            rotate: [item.rotate, item.rotate + 15, item.rotate],
            opacity: item.opacity || [0.1, 0.25, 0.1]
          }}
          transition={{ 
            duration: 10 + index * 2, // Thời gian trôi khác nhau cho tự nhiên
            repeat: Infinity, 
            ease: "easeInOut",
            delay: item.delay
          }}
        >
          <item.Icon 
            size={item.size} 
            strokeWidth={0.4} // Nét siêu mảnh cho nghệ
            style={{ color: activeColor }} 
          />
        </motion.div>
      ))}
      
      {/* Hiệu ứng hạt bụi nhỏ lấp lánh (Overlay) */}
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#77cd3a_1px,transparent_1px)] [background-size:40px_40px]" />
    </div>
  );
};

export default FloatingVegetables;