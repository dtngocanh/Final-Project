import React from "react";
import { motion } from "framer-motion";
import { X, RefreshCcw } from "lucide-react";

const ExpandedFilter = ({ filters, setFilters, onClose, isMobile = false }) => {
  const initialFilters = { rating: null, stock: "all", maxPrice: 150 };

  const handleChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleReset = () => {
    setFilters(initialFilters);
  };

  // Cấu trúc Content của bộ lọc dùng chung cho cả 2 giao diện
  const FilterContent = () => (
    <div className="space-y-8">
      {/* PRICE RANGE FILTER */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Max Price
          </span>
          <span className="text-xs font-black text-[#77cd3a] bg-[#77cd3a]/10 px-2 py-0.5 rounded-md">
            ${filters.maxPrice}
          </span>
        </div>
        <div className="relative pt-1">
          <input
            type="range"
            min="5"
            max="150"
            value={filters.maxPrice}
            onChange={(e) => handleChange("maxPrice", Number(e.target.value))}
            className="w-full accent-[#77cd3a] bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 mt-1.5 font-medium">
            <span>$5</span>
            <span>$75</span>
            <span>$150</span>
          </div>
        </div>
      </div>

      {/* STOCK AVAILABILITY */}
      <div>
        <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
          Availability
        </span>
        <div className="flex flex-col gap-2">
          {[
            { id: "all", label: "All Items Available" },
            { id: "in", label: "In Stock Only" }
          ].map((item) => {
            const isSelected = filters.stock === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleChange("stock", item.id)}
                className={`w-full py-2.5 px-4 rounded-xl border text-left text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "border-[#77cd3a] bg-[#77cd3a]/5 text-[#77cd3a]"
                    : "border-neutral-200 dark:border-neutral-800/60 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-white/5"
                }`}
              >
                <span>{item.label}</span>
                {isSelected && <div className="w-2 h-2 rounded-full bg-[#77cd3a]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* RESET BUTTON */}
      <button
        onClick={handleReset}
        className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
      >
        <RefreshCcw size={12} />
        <span>Reset Filters</span>
      </button>
    </div>
  );

  // 1. GIAO DIỆN TRÊN DESKTOP: Hiển thị tĩnh bên trái, không có hiệu ứng đóng mở đè màn hình
  if (!isMobile) {
    return (
      <div className="w-full sticky top-32 bg-white dark:bg-[#0b0b0b] rounded-2xl p-6 border border-neutral-100 dark:border-neutral-800/60 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-800 dark:text-neutral-200 mb-6 pb-3 border-b border-neutral-100 dark:border-neutral-800/60">
          Filter Options
        </h2>
        <FilterContent />
      </div>
    );
  }

  // 2. GIAO DIỆN TRÊN MOBILE: Biến thành Bottom Sheet trượt mượt mà từ dưới lên
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 lg:hidden"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-[#0b0b0b] rounded-t-[2rem] shadow-2xl z-55 flex flex-col border-t border-neutral-100 dark:border-neutral-800/60 lg:hidden"
      >
        {/* Nút kéo giả lập của Bottom Sheet */}
        <div className="w-12 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full mx-auto mt-3 mb-2" />
        
        <div className="p-6 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/60">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">Filters</h2>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-[#77cd3a] cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pb-12">
          <FilterContent />
        </div>
      </motion.div>
    </>
  );
};

export default ExpandedFilter;