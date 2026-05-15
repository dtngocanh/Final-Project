import React from "react";
import { motion } from "framer-motion";

const FruitChat = () => {
  const loadingText = "WAIT A MINUTES...".split("");
  const totalDuration = 3; 

  return (
    // 1. Đổi justify-center -> justify-start và thêm padding left (pl-2)
    <div className="h-[40px] flex items-center justify-start bg-white/50 backdrop-blur-sm overflow-hidden pl-2">
      <div className="flex flex-col items-start relative w-full">
        
        {/* 2. Loại bỏ px-20 (padding lớn gây đẩy vào giữa) */}
        <div className="relative flex items-center justify-start py-4">
          
          {/* 3. Cà chua: Chỉnh lại x để chạy từ sát lề (0) đến hết dòng chữ */}
          <motion.div
            className="absolute z-20 flex flex-col items-center"
            style={{ left: 0, width: "40px" }} // Thu nhỏ width container cà chua
            animate={{ 
              x: ["0px", "120px"], // Giảm khoảng cách chạy vì chữ lúc này sát lề
            }}
            transition={{
              duration: totalDuration,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <img
              src="/TOMATOGIF.gif"
              alt="Tomato"
              className="w-12 h-12 object-contain" 
            />
            <div className="w-5 h-1 bg-gray-200/80 rounded-full blur-[2px] mt-[-4px]" />
          </motion.div>

          {/* 4. Dòng chữ: Thêm margin-left để cà chua có khoảng trống bắt đầu */}
          <div className="flex gap-1 ml-2">
            {loadingText.map((letter, index) => (
              <motion.span
                key={index}
                className="text-[10px] font-bold text-green-500 uppercase"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: [0, 1, 1, 0], 
                  scale: [0.5, 1.1, 1, 0.5] 
                }}
                transition={{
                  duration: totalDuration,
                  repeat: Infinity,
                  delay: (index * (totalDuration / (loadingText.length + 2))),
                  times: [0, 0.1, 0.9, 1],
                  ease: "easeInOut"
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FruitChat;