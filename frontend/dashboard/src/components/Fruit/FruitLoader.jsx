import React from "react";
import { motion } from "framer-motion";

const FruitLoader = () => {
  const loadingText = "WAIT A MINUTE...".split("");
  const totalDuration = 3;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md z-[9999] select-none">
      <div className="relative flex flex-col items-center">
        
        {/* Container cho chữ và cà chua */}
         {/* Khu vực chứa animation */}
               <div className="relative flex items-center justify-center py-10 px-20">
                 
                 {/* 1. Quả cà chua nhỏ xinh chạy ngang */}
                 <motion.div
                   className="absolute z-20 flex flex-col items-center"
                   style={{ left: 0, width: "60px" }}
                   animate={{ 
                     x: ["60px", "300px"], // Chạy từ đầu đến cuối dòng chữ
                   }}
                   transition={{
                     duration: totalDuration,
                     repeat: Infinity,
                     ease: "linear",
                   }}
                 >
                   <img
                     src="/tomatorun.gif"
                     alt="Tomato"
                     className="w-10 h-10 object-contain" // Thu nhỏ cà chua
                   />
                   {/* Shadow nhỏ chân thực */}
                   <div className="w-6 h-1 bg-gray-200/80 rounded-full blur-[2px] mt-[-4px]" />
                 </motion.div>
       
                 {/* 2. Dòng chữ LOADING... */}
                 <div className="flex gap-1.5">
                   {loadingText.map((letter, index) => (
                     <motion.span
                       key={index}
                       className="text-[13px] font-semibold text-neutral-900 dark:text-white capitalize text-green-300"
                       initial={{ opacity: 0, scale: 0.5 }}
                       animate={{ 
                         opacity: [0, 1, 1, 0], // Hiện lên rồi ẩn đi để lặp lại vòng mới
                         scale: [0.5, 1.1, 1, 0.5] 
                       }}
                       transition={{
                         duration: totalDuration,
                         repeat: Infinity,
                         // Delay cực kỳ quan trọng: giúp chữ hiện đúng lúc cà chua đi qua
                         delay: (index * (totalDuration / (loadingText.length + 2))),
                         times: [0, 0.1, 0.9, 1], // Kiểm soát thời điểm hiện/ẩn trong 1 chu kỳ
                         ease: "easeInOut"
                       }}
                     >
                       {letter}
                     </motion.span>
                   ))}
                 </div>
               </div>
       
               {/* 3. Caption bên dưới */}
               <div className="mt-2 flex flex-col items-center">
                 <motion.p
                   className="text-[11px] tracking-widest uppercase"
                   animate={{ opacity: [0.4, 1, 0.4] }}
                   transition={{ duration: 2, repeat: Infinity }}
                 >
                   
                   Veggies welcome
                 </motion.p>
               </div>
      </div>
    </div>
  );
};

export default FruitLoader;