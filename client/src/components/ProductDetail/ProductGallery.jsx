import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ProductGallery = ({ images, selectedIndex, setSelectedIndex, isOutOfStock }) => {
  // Tránh lỗi nếu images bị undefined hoặc rỗng
  if (!images || images.length === 0) return null;

  return (
    <div className="w-full space-y-4">
      {/* KHUNG ẢNH CHÍNH */}
      <div className="relative aspect-square bg-[#fafafa] dark:bg-white/[0.015] rounded-[28px] md:rounded-[40px] flex items-center justify-center p-8 md:p-12 border border-gray-100 dark:border-white/[0.04] overflow-hidden group">
        
        {/* Hiệu ứng chuyển cảnh ảnh */}
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedIndex}
            src={images[selectedIndex]}
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full object-contain z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-transform duration-700 group-hover:scale-105"
            alt="Product view"
          />
        </AnimatePresence>

        {/* Overlay Hết hàng */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/40 dark:bg-black/60 backdrop-blur-md z-20 flex items-center justify-center">
            <motion.span 
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, letterSpacing: "0.5em" }}
              className="text-[10px] uppercase font-black text-red-500 bg-white/80 dark:bg-black/80 px-4 py-2 rounded-full shadow-xl"
            >
              Out of Stock
            </motion.span>
          </div>
        )}

        {/* Decor background cực nhẹ cho Dark mode */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#77cd3a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      </div>

      {/* THUMBNAILS (Ảnh nhỏ phía dưới) */}
      <div className="flex gap-3 justify-center items-center">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelectedIndex(i)}
            className={`relative w-12 h-12 md:w-14 md:h-14 rounded-2xl border transition-all duration-300 overflow-hidden p-1.5 ${
              i === selectedIndex 
                ? "border-[#77cd3a] bg-white dark:bg-white/10 shadow-lg shadow-[#77cd3a]/10" 
                : "border-transparent bg-gray-50 dark:bg-white/[0.02] opacity-40 hover:opacity-100 hover:scale-105"
            }`}
          >
            <img src={img} className="w-full h-full object-contain" alt={`Thumbnail ${i}`} />
            
            {/* Thanh indicator nhỏ khi active */}
            {i === selectedIndex && (
              <motion.div 
                layoutId="activeThumb"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#77cd3a]"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;