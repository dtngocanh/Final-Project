import React from "react";
import { X, ChefHat, Sparkles } from "lucide-react";

const RecipeSuggestionModal = ({ isOpen, item, recipe, onClose, navigate }) => {
  if (!isOpen || !recipe) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#08080a] rounded-[40px] p-6 md:p-8 max-w-sm w-full relative shadow-2xl border border-neutral-100 dark:border-white/10 animate-in zoom-in-95 duration-300">
        
        {/* Nút đóng */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-neutral-100 dark:bg-white/5 rounded-full hover:bg-neutral-200 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-[#77cd3a]" size={16} />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#77cd3a]">
            Gợi ý món ăn từ AI
          </span>
        </div>

        {/* Nội dung nguyên liệu bạn có */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-neutral-50 dark:bg-white/5 rounded-2xl border border-neutral-100 dark:border-none">
          <img 
            src={item.image} 
            className="w-12 h-12 rounded-xl object-cover" 
            alt={item.name} 
          />
          <div>
            <p className="text-[9px] uppercase font-bold text-neutral-400">Nguyên liệu sẵn có</p>
            <h3 className="font-bold text-sm dark:text-white">{item.name}</h3>
          </div>
        </div>

        {/* Nội dung công thức */}
        <div className="space-y-4">
          <img 
            src={recipe.strMealThumb} 
            className="w-full h-48 object-cover rounded-3xl" 
            alt={recipe.strMeal} 
          />
          <div>
            <h2 className="text-xl font-bold dark:text-white leading-tight mb-2">
              {recipe.strMeal}
            </h2>
            <p className="text-[11px] text-neutral-400">
              Sử dụng nguyên liệu của bạn để chế biến món ăn ngon tuyệt này.
            </p>
          </div>

          <button 
            onClick={() => {
              onClose();
              navigate(`/recipe/${recipe.idMeal}`); // Điều hướng đến trang chi tiết công thức
            }}
            className="w-full h-12 bg-[#77cd3a] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#66b330] transition-colors mt-4"
          >
            <ChefHat size={16} />
            Xem công thức chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeSuggestionModal;