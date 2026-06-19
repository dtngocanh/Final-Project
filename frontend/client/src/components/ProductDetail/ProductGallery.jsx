import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ProductGallery = ({ images, selectedIndex, setSelectedIndex, isOutOfStock }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="w-full space-y-6">
      {/* KHUNG ẢNH CHÍNH */}
      <div className="relative aspect-square w-full bg-white dark:bg-[#0a0a0a] rounded-[32px] md:rounded-[48px] flex items-center justify-center border border-neutral-200 dark:border-white/[0.08] overflow-hidden group shadow-2xl shadow-neutral-200/50 dark:shadow-none">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full flex items-center justify-center p-8 md:p-12"
          >
            {/* Class 'product-gallery-active-img' dùng để định vị ảnh khi bay vào giỏ */}
            <img
              src={images[selectedIndex].url}
              className="product-gallery-active-img w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transform-gpu"
              style={{ 
                WebkitBackfaceVisibility: "hidden",
                imageRendering: "-webkit-optimize-contrast" 
              }}
              alt="Product view"
            />
          </motion.div>
        </AnimatePresence>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/70 backdrop-blur-sm z-20 flex items-center justify-center">
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-black dark:text-white bg-white/90 dark:bg-black/90 px-6 py-2 rounded-full border border-neutral-200 dark:border-neutral-800">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-4 justify-center items-center">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelectedIndex(i)}
            className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl transition-all duration-300 overflow-hidden border-2 ${
              i === selectedIndex 
                ? "border-[#77cd3a] ring-2 ring-[#77cd3a]/20" 
                : "border-transparent opacity-60 hover:opacity-100 hover:border-neutral-300"
            }`}
          >
            <img src={img.url} className="w-full h-full object-cover" alt={`Thumbnail ${i}`} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;