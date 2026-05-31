import React from "react";
import { Star, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RatingDropdown = ({ filters, setFilters, isOpen, setOpen }) => {
  return (
    <div className="relative">
      <button
        onClick={setOpen}
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 dark:hover:text-white transition-all"
      >
        {filters.rating ? (
          <div className="flex gap-0.5 items-center">
            {[...Array(filters.rating)].map((_, i) => (
              <Star key={i} size={12} fill="#77cd3a" className="text-[#77cd3a]" />
            ))}
            <span className="text-[#77cd3a] ml-1">{filters.rating}+</span>
          </div>
        ) : (
          "Rating"
        )}
        <ChevronDown size={14} className={isOpen ? "rotate-180" : ""} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-4 w-40 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/10 p-4 rounded-2xl shadow-xl z-50"
          >
            {[5, 4, 3].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setFilters({ ...filters, rating: s });
                  setOpen();
                }}
                className="flex items-center justify-between w-full py-2 hover:opacity-60"
              >
                <div className="flex gap-0.5">
                  {[...Array(s)].map((_, i) => (
                    <Star key={i} size={10} fill="#77cd3a" className="text-[#77cd3a]" />
                  ))}
                </div>
                <span className="text-[10px] text-gray-400 font-bold">{s}+</span>
              </button>
            ))}
            {filters.rating && (
              <button
                onClick={() => {
                  setFilters({ ...filters, rating: null });
                  setOpen();
                }}
                className="w-full mt-2 pt-2 border-t border-gray-100 dark:border-white/5 text-[10px] text-red-400 uppercase font-bold"
              >
                Clear
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RatingDropdown;