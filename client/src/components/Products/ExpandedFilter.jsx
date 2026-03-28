import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const ExpandedFilter = ({ filters, setFilters, onClose }) => {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      // Quan trọng: z-30 và relative/absolute phải chuẩn
      className="absolute top-full left-0 w-full mt-4 py-8 border-y border-gray-100 dark:border-white/5 bg-white dark:bg-[#060606] z-40 overflow-hidden"
    >
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-gray-400 hover:text-[#77cd3a] p-2"
      >
        <X size={20} />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-6">
            Max Price: <span className="text-[#77cd3a] font-bold">${filters.maxPrice}</span>
          </p>
          <input
            type="range" min="10" max="150"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            className="w-full accent-[#77cd3a] cursor-pointer"
          />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-6">Availability</p>
          <div className="flex gap-6">
            {["all", "in"].map((s) => (
              <button
                key={s}
                onClick={() => setFilters({ ...filters, stock: s })}
                className={`text-[10px] uppercase tracking-widest transition-all ${
                  filters.stock === s ? "text-[#77cd3a] font-black" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {s === "all" ? "All Items" : "In Stock Only"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ExpandedFilter;