import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ProductGallery = ({ images, selectedIndex, setSelectedIndex, isOutOfStock }) => {
  // Tránh lỗi nếu images bị undefined hoặc rỗng
  if (!images || images.length === 0) return null;

  return (
    <div className="w-full space-y-4">
      {/* KHUNG ẢNH CHÍNH */}
      <div className="relative aspect-square bg-[#fafafa] dark:bg-white/[0.015] rounded-[28px] md:rounded-[40px] flex items-center justify-center border border-gray-100 dark:border-white/[0.04] overflow-hidden group">
        
        {/* LOGIC ẢNH GIỐNG PRODUCT SLIDER: Phóng to 80% và dùng object-cover */}
        <div className="w-full h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-[80%] h-[80%] flex items-center justify-center overflow-hidden rounded-[2rem] border border-neutral-100 dark:border-white/5 bg-white/50 dark:bg-neutral-900 shadow-inner z-10 group-hover:scale-105 transition-transform duration-700"
            >
              <img
                src={images[selectedIndex].url}
                className="w-full h-full object-cover filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
                alt="Product view"
              />
            </motion.div>
          </AnimatePresence>
        </div>

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

        {/* Decor background cực nhẹ */}
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
            {/* Thumbnail cũng dùng object-cover cho đồng bộ */}
            <img src={img.url} className="w-full h-full object-cover rounded-lg" alt={`Thumbnail ${i}`} />
            
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