import { useState, useEffect, useRef } from "react";
import { X, Search, Leaf, Sparkles, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toggleSearchBar } from "../../store/slices/popupSlice";
import {
  clearSearchResults,
  searchProducts,
} from "../../store/slices/productSlice";
import { setCategory } from "../../store/slices/categorySlice";

const SearchOverlay = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { isSearchBarOpen } = useSelector((state) => state.popup);
  const { searchSug, loadingSearch } = useSelector((state) => state.product);

  useEffect(() => {
    if (isSearchBarOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [isSearchBarOpen]);

  useEffect(() => {
    const isQueryValid = searchQuery.trim().length > 1;

    if (isQueryValid) {
      const delayDebounceFn = setTimeout(() => {
        dispatch(clearSearchResults());
        dispatch(searchProducts({ q: searchQuery }));
      }, 400);

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
  if (!isSearchBarOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none">
      {/* BACKGROUND MỜ */}
      <div
        className="absolute inset-0 bg-black/10 dark:bg-gray-950/40 backdrop-blur-md pointer-events-auto animate-in fade-in duration-500"
        onClick={() => dispatch(toggleSearchBar())}
      />

      {/* THANH SEARCH TRƯỢT XUỐNG */}
      <div className="relative bg-white/95 dark:bg-gray-900/98 backdrop-blur-3xl border-b border-gray-100 dark:border-gray-800 shadow-2xl pointer-events-auto transform transition-all duration-500 ease-out animate-in slide-in-from-top-full">
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
          <button
            onClick={() => dispatch(toggleSearchBar())}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-[#025c37] transition-all"
          >
            <X size={24} strokeWidth={1.5} />
          </button>

          <form
            onSubmit={handleFinalSearch}
            className="flex flex-col items-center"
          >
            <div className="flex items-center gap-2 mb-4 text-[#025c37] dark:text-[#77cd3af2] opacity-70">
              <span className="uppercase tracking-[0.4em] text-[10px] font-bold">
                Veganic Mart
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-light text-center text-gray-800 dark:text-white mb-10 tracking-tight">
              Looking for{" "}
              <span className="font-serif italic border-b-2 border-[#77cd3af2]/30">
                something fresh
              </span>
              ?
            </h2>

            <div className="relative w-full max-w-3xl group">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search here..."
                  className="w-full bg-transparent border-b border-gray-200 dark:border-gray-800 py-4 text-2xl md:text-4xl font-light text-center outline-none focus:border-[#025c37] dark:focus:border-[#77cd3af2] transition-all duration-500"
                />
                {loadingSearch && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <Loader2
                      className="animate-spin text-[#77cd3af2]"
                      size={24}
                    />
                  </div>
                )}
              </div>

              {/* LIVE SUGGESTIONS */}
              {searchQuery.length > 1 && (
                <div className="absolute w-full mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                  {loadingSearch ? (
                    <div className="p-10 flex flex-col items-center justify-center gap-3">
                      <Loader2
                        className="animate-spin text-[#77cd3af2]"
                        size={30}
                      />
                      <p className="text-sm text-gray-400">
                        Searching fresh items...
                      </p>
                    </div>
                  ) : (
                    searchSug.slice(0, 5).map((item) => (
                      <div
                        key={item._id}
                        onClick={(e) => handleFinalSearch(e, item.name)}
                        className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer flex items-center justify-between border-b last:border-0 border-gray-50 dark:border-gray-700"
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                            {item.name}
                          </span>
                          <span className="text-xs text-gray-400 uppercase tracking-widest">
                            {item.categoryName}
                          </span>
                        </div>
                        <Sparkles size={16} className="text-[#77cd3af2]" />
                      </div>
                    ))
                  )}
                </div>
              )}

              <div
                className={`mt-4 flex items-center justify-center gap-2 text-[11px] font-bold tracking-widest text-gray-400 transition-all duration-500 ${searchQuery ? "opacity-100" : "opacity-0"}`}
              >
                <span className="uppercase">
                  Press Enter to See All Results
                </span>
              </div>
            </div>

            {/* QUICK TAGS */}
            <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2">
              {[
                "Citrus",
                "Oat Milk",
                "Potato",
                "Vegan",
                "Cooking",
                "Protein",
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => handleFinalSearch(e, tag)}
                  className="group relative py-1 text-gray-400 hover:text-[#025c37] dark:hover:text-[#77cd3af2] transition-all"
                >
                  <span className="text-sm font-light tracking-wide">
                    {tag}
                  </span>
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
