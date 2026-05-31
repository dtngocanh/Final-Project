import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // --- BẮT ĐẦU LOGIC THEO ẢNH CỦA BẠN ---
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Trường hợp ở giữa (Để logic đầy đủ hơn)
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
      // --- KẾT THÚC LOGIC THEO ẢNH CỦA BẠN ---
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-3 py-16 font-sans">
      {/* Nút Back */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 text-gray-400 hover:text-[#77cd3a] disabled:opacity-10 transition-colors"
      >
        <ChevronLeft size={20} strokeWidth={1.5} />
      </button>

      {/* Danh sách các số trang */}
      <div className="flex items-center gap-1">
        <AnimatePresence mode="popLayout">
          {getPageNumbers().map((page, index) => {
            const isActive = page === currentPage;
            const isEllipsis = page === "...";

            if (isEllipsis) {
              return (
                <span key={`ellipsis-${index}`} className="px-3 text-gray-300 dark:text-gray-600">
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className="relative px-4 py-2 text-sm font-medium transition-all group"
              >
                <span
                  className={`relative z-10 transition-colors duration-300 ${
                    isActive ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-[#77cd3a]"
                  }`}
                >
                  {page.toString().padStart(2, "0")}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="active-bg"
                    className="absolute inset-0 bg-[#77cd3a] rounded-xl shadow-[0_8px_20px_rgba(119,205,58,0.25)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Nút Next */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 text-gray-400 hover:text-[#77cd3a] disabled:opacity-10 transition-colors"
      >
        <ChevronRight size={20} strokeWidth={1.5} />
      </button>
    </nav>
  );
};

export default Pagination;