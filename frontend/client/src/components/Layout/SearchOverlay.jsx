import { useState, useEffect, useRef } from "react";
import { X, Search, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toggleSearchBar } from "../../store/slices/popupSlice";
import {
  clearSearchResults,
  searchProducts,
} from "../../store/slices/productSlice";
import { setCategory } from "../../store/slices/categorySlice";
import { trackClickThunk } from "../../store/slices/interactionSlice";

const SearchOverlay = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const { isSearchBarOpen } = useSelector((state) => state.popup);
  const { searchSug = [], loadingSearch } = useSelector(
    (state) => state.product,
  );

  useEffect(() => {
    if (isSearchBarOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isSearchBarOpen]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length > 1) {
      const delayDebounceFn = setTimeout(() => {
        dispatch(clearSearchResults());
        dispatch(searchProducts({ q: query }));
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      dispatch(clearSearchResults());
    }
  }, [searchQuery, dispatch]);

  const handleFinalSearch = (e, customQuery) => {
    e?.preventDefault();
    const finalQuery = (customQuery || searchQuery).trim();

    if (finalQuery) {
      dispatch(setCategory("All"));
      dispatch(toggleSearchBar());
      navigate(`/products?q=${encodeURIComponent(finalQuery)}`);
      setSearchQuery("");
      dispatch(clearSearchResults());
    }
  };

  const handleSugClick = (product) => {
    dispatch(
      trackClickThunk({
        productId: product._id,
        action: "search_click",
        searchQuery: searchQuery,
      }),
    );
    dispatch(toggleSearchBar());
    navigate(`/product/${product._id}`);
    setSearchQuery("");
    dispatch(clearSearchResults());
  };

  if (!isSearchBarOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-start items-center bg-gray-900/30 dark:bg-black/60 backdrop-blur-xl px-4 pt-12 sm:pt-28 pb-6 overflow-y-auto animate-in fade-in duration-300">
      <div
        className="absolute inset-0 z-0"
        onClick={() => dispatch(toggleSearchBar())}
      />

      <div className="relative z-10 w-full max-w-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-[28px] border border-gray-100 dark:border-gray-800/60 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.4)] transform transition-all duration-300 animate-in slide-in-from-top-4">
        <button
          onClick={() => dispatch(toggleSearchBar())}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 z-50"
        >
          <X size={18} strokeWidth={2} />
        </button>

        <div className="p-5 sm:p-8">
          <div className="flex flex-col items-center mb-6 text-center select-none">
            <span className="text-[#025c37] dark:text-[#77cd3af2] tracking-[0.3em] text-[10px] font-bold uppercase mb-1.5 opacity-80">
              Veggies Mart
            </span>
            <h2 className="text-xl sm:text-2xl font-light text-gray-800 dark:text-gray-100 tracking-tight">
              What are you{" "}
              <span className="font-serif italic text-[#025c37] dark:text-[#77cd3af2]">
                looking for
              </span>
              ?
            </h2>
          </div>

          <form onSubmit={handleFinalSearch} className="w-full">
            {/* INPUT BOX */}
            <div className="relative flex items-center bg-gray-50/80 dark:bg-gray-950/40 rounded-xl border border-gray-100 dark:border-gray-800/80 px-3.5 py-1 focus-within:border-[#025c37]/50 dark:focus-within:border-[#77cd3af2]/50 focus-within:bg-white dark:focus-within:bg-gray-950 shadow-inner focus-within:shadow-sm transition-all duration-300">
              <Search
                size={18}
                className="text-gray-400 ml-1 flex-shrink-0 z-10"
              />

              <div className="relative flex-1 flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="What are you craving today? Let's stock up!..." // Câu placeholder kích thích mua sắm của bạn
                  value={searchQuery} // Quay về dùng state chuẩn của component
                  onChange={(e) => setSearchQuery(e.target.value)} // Cập nhật trực tiếp vào state để trigger useEffect debounce bên trên
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // Chặn hành vi submit form mặc định của trình duyệt gây reload trang
                      handleFinalSearch(e); // Thực hiện điều hướng sang trang /products kèm theo từ khóa
                    }
                  }}
                  className="w-full bg-transparent py-2.5 pl-3 pr-8 text-base font-normal text-gray-800 dark:text-white placeholder-gray-400/90 dark:placeholder-gray-500 outline-none z-10"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0 z-10">
                {loadingSearch && (
                  <Loader2
                    className="animate-spin text-[#025c37] dark:text-[#77cd3af2]"
                    size={16}
                  />
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* LIVE SUGGESTIONS BOX */}
            {searchQuery.trim().length > 1 && (
              <div className="mt-4 bg-transparent border-t border-gray-100 dark:border-gray-800/60 pt-2 transition-all duration-300">
                {loadingSearch && searchSug.length === 0 ? (
                  <div className="p-10 flex flex-col items-center justify-center gap-2">
                    <Loader2
                      className="animate-spin text-[#025c37] dark:text-[#77cd3af2]"
                      size={22}
                    />
                    <p className="text-[11px] tracking-wider text-gray-400 uppercase font-medium">
                      Finding products...
                    </p>
                  </div>
                ) : searchSug.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-light">
                      No products found for "
                      <span className="font-normal text-gray-600 dark:text-gray-300">
                        {searchQuery}
                      </span>
                      "
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-1 custom-scrollbar">
                    {searchSug.slice(0, 5).map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleSugClick(item)}
                        className="p-2 rounded-xl cursor-pointer flex items-center justify-between border border-transparent hover:border-gray-100 dark:hover:border-gray-800/80 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {item.images ? (
                              <img
                                src={item.images?.[0]?.url || "/placeholder.png"}
                                alt={item.name}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <Sparkles
                                size={14}
                                className="text-gray-300 dark:text-gray-600"
                              />
                            )}
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-[#025c37] dark:group-hover:text-[#77cd3af2] transition-colors duration-200 truncate">
                              {item.name}
                            </span>
                            <span className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold tracking-wider uppercase mt-0.5">
                              {item.categoryName || "Fresh Food"}
                            </span>
                          </div>
                        </div>

                        <div className="pr-1 transform opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 flex-shrink-0">
                          <ArrowRight
                            size={14}
                            className="text-[#025c37] dark:text-[#77cd3af2]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TRENDING TAGS */}
            <div className="mt-6 pt-4 border-t border-gray-100/70 dark:border-gray-800/50">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap">
                  Suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-16">
                  {["Citrus", "Oat Milk", "Potato", "Vegan", "Cooking"].map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={(e) => handleFinalSearch(e, tag)}
                        className="px-3 py-1 bg-gray-50/60 hover:bg-gray-100 dark:bg-gray-800/40 dark:hover:bg-gray-800 border border-gray-100/50 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 hover:text-[#025c37] dark:hover:text-[#77cd3af2] rounded-lg text-xs font-normal transition-all duration-200"
                      >
                        {tag}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
