import { SearchX, RefreshCcw } from "lucide-react";

export const NoProductsFound = ({ onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-full mb-8">
        <SearchX size={48} className="text-gray-300 dark:text-gray-600" />
      </div>
      
      {/* <h3 className="text-2xl font-light tracking-tight dark:text-white mb-3">
        No Products Found
      </h3> */}
      
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-10 leading-relaxed">
        We couldn't find anything matching your filters. Try adjusting your search or explore our other fresh collections.
      </p>

      <button
        onClick={onReset}
        className="group flex items-center gap-3 bg-[#77cd3a] text-white px-8 py-3.5 rounded-full font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-[#66b131] transition-all shadow-lg shadow-[#77cd3a]/20"
      >
        <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
        Explore All Products
      </button>
    </div>
  );
};