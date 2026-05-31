import React, { useState } from "react";
import { X, Search, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";

// Thêm prop onClose để nhận hàm đóng từ component cha
const AISearchModal = ({ onClose }) => {
  const [userPrompt, setUserPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;

    setIsLoading(true);
    try {
      console.log("Searching for:", userPrompt);
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Nếu muốn tìm xong tự đóng modal thì gọi: onClose();
    } catch (error) {
      console.error("AI Search Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Thêm onClick={onClose} vào div cha để đóng khi click ra ngoài
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl"
      onClick={onClose} 
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        // Ngăn sự kiện click từ modal lan ra ngoài (không bị đóng khi click vào trong modal)
        onClick={(e) => e.stopPropagation()} 
        className="w-full max-w-2xl bg-white dark:bg-[#111] rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-white/5 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#77cd3a]/10 rounded-lg text-[#77cd3a]">
              <Sparkles size={20} />
            </div>
            <h2 className="text-xl font-medium tracking-tight dark:text-white">AI Personal Assistant</h2>
          </div>
          <button 
            onClick={onClose} // Gọi hàm đóng khi click nút X
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {/* Description */}
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed font-light">
            Describe what you're looking for (e.g., flavor, mood, or health goals) and our AI will find the perfect products for you.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative group">
            <div className="relative">
              <Search 
                className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                  isLoading ? "text-[#77cd3a]" : "text-gray-400"
                }`} 
                size={20} 
                strokeWidth={1.5}
              />
              
              <input
                type="text"
                autoFocus
                placeholder="e.g., 'A fresh fruit basket for a morning gift with mango and cherry'"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="w-full pl-14 pr-32 py-5 bg-gray-50 dark:bg-white/[0.02] border border-transparent focus:border-[#77cd3a]/30 rounded-2xl outline-none text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all text-lg font-light"
                required
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <button
                  type="submit"
                  disabled={isLoading || !userPrompt.trim()}
                  className="px-6 py-2.5 bg-[#77cd3a] text-black font-medium rounded-xl hover:opacity-90 disabled:opacity-30 disabled:grayscale transition-all flex items-center gap-2 overflow-hidden"
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <span>Find</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Loading Decoration */}
            <AnimatePresence>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#77cd3a] to-transparent animate-pulse"
                />
              )}
            </AnimatePresence>
          </form>

          {/* Suggested Tags */}
          {!isLoading && (
            <div className="mt-8 flex flex-wrap gap-2">
              {["Sweet & Juicy", "High Vitamin C", "Detox Green", "Premium Gifts"].map((tag) => (
                <button 
                  key={tag}
                  type="button" // Tránh submit form
                  onClick={() => setUserPrompt(tag)}
                  className="px-4 py-2 text-xs font-medium text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-white/5 rounded-full hover:border-[#77cd3a] hover:text-[#77cd3a] transition-all"
                >
                  + {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AISearchModal;