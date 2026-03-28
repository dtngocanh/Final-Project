import { useState, useEffect, useRef } from "react";
import { X, Search, Leaf, Sparkles } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toggleSearchBar } from "../../store/slices/popupSlice";

const SearchOverlay = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { isSearchBarOpen } = useSelector((state) => state.popup);
  
  useEffect(() => {
    if (isSearchBarOpen) {
      // Focus vào input ngay khi nó trượt xuống
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [isSearchBarOpen]);

  if (!isSearchBarOpen) return null;

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery.trim() !== "") {
      dispatch(toggleSearchBar());
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none">
      
      {/* 1. NỀN KÍNH MỜ NHẸ (Chỉ làm mờ phần dưới thanh search) */}
      <div 
        className="absolute inset-0 bg-black/5 dark:bg-gray-950/20 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-500"
        onClick={() => dispatch(toggleSearchBar())}
      />
      
      {/* 2. THANH SEARCH TRƯỢT XUỐNG (STYLE NGHỆ THUẬT) */}
      <div className="relative bg-white/90 dark:bg-gray-900/95 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-800 shadow-2xl pointer-events-auto transform transition-all duration-500 ease-out animate-in slide-in-from-top-full">
        
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
          
          {/* Nút đóng góc trên bên phải thanh trượt */}
          <button 
            onClick={() => dispatch(toggleSearchBar())}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-[#025c37] dark:hover:text-[#77cd3af2] transition-all"
          >
            <X size={24} strokeWidth={1.5} />
          </button>

          <form onSubmit={handleSearch} className="flex flex-col items-center">
            
            {/* BRANDING NHỎ (Giữ đúng style hình má gửi) */}
            <div className="flex items-center gap-2 mb-4 text-[#025c37] dark:text-[#77cd3af2] opacity-70">
              <img src="/hahahaha.png" alt="" />
              <span className="uppercase tracking-[0.4em] text-[10px] font-bold">Veganic Mart</span>
            </div>

            {/* TIÊU ĐỀ NGHỆ THUẬT */}
            <h2 className="text-3xl md:text-5xl font-light text-center text-gray-800 dark:text-white mb-10 tracking-tight">
              Looking for <span className="font-serif italic border-b-2 border-[#77cd3af2]/30">something fresh</span>?
            </h2>

            {/* INPUT ĐƯỜNG KẺ (KIỂU A NHƯNG STYLE B) */}
            <div className="relative w-full max-w-3xl group">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Start typing..."
                className="w-full bg-transparent border-b border-gray-200 dark:border-gray-800 py-4 text-2xl md:text-4xl font-light text-center outline-none focus:border-[#025c37] dark:focus:border-[#77cd3af2] transition-all duration-500 placeholder:text-gray-200 dark:placeholder:text-gray-700"
              />
              
              {/* Tip nhỏ khi gõ */}
              <div className={`mt-4 flex items-center justify-center gap-2 text-[11px] font-bold tracking-widest text-gray-400 transition-all duration-500 ${searchQuery ? 'opacity-100' : 'opacity-0'}`}>
                <Sparkles size={12} className="text-[#77cd3af2]" />
                <span className="uppercase">Press Enter to Search</span>
              </div>
            </div>

            {/* QUICK TAGS (Nằm gọn bên dưới) */}
            <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2">
              {["Tofu", "Oat Milk", "Tempeh", "Kale"].map((tag) => (
                <button 
                  key={tag}
                  type="button"
                  onClick={() => setSearchQuery(tag)}
                  className="group relative py-1 text-gray-400 hover:text-[#025c37] dark:hover:text-[#77cd3af2] transition-all"
                >
                  <span className="text-sm font-light tracking-wide">{tag}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#77cd3af2] transition-all duration-300 group-hover:w-full" />
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;