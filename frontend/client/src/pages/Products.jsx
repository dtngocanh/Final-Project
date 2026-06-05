import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  ArrowUpDown,
  Carrot,
  Citrus,
  Cherry,
  Salad,
  X,
  LayoutGrid,
  Grid3X3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
// Components
import ProductCard from "../components/Products/ProductCard";
import Pagination from "../components/Products/Pagination";
import { NoProductsFound } from "../components/Products/NoProductsFound";
import FruitLoader from "../components/Fruit/FruitLoader";

// Store actions
import { fetchAllProducts, searchProducts } from "../store/slices/productSlice";
import { fetchCategories, setCategory } from "../store/slices/categorySlice";

// EFFECT RAU CỦ TRÔI NỔI & LOANG MÀU NỀN LUXURY
const ElegantHeaderDecor = () => {
  const decorItems = [
    {
      Icon: Carrot,
      size: "text-[26px] md:text-[40px]",
      top: "-15px",
      left: "6%",
      rotate: -15,
      duration: 8,
    },
    {
      Icon: Citrus,
      size: "text-[20px] md:text-[32px]",
      top: "35px",
      left: "18%",
      rotate: 20,
      duration: 9,
    },
    {
      Icon: Cherry,
      size: "text-[16px] md:text-[26px]",
      top: "-15px",
      right: "20%",
      rotate: 15,
      duration: 7,
    },
    {
      Icon: Salad,
      size: "text-[24px] md:text-[36px]",
      top: "30px",
      right: "6%",
      rotate: -25,
      duration: 10,
    },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
      {/* Khối màu Aura mờ ảo nghệ thuật phủ kín dải trên sát Navbar */}
      <div className="absolute top-[-60px] left-[15%] w-[350px] md:w-[600px] h-[300px] bg-gradient-to-tr from-[#6cbd2f]/20 via-[#4ade80]/10 to-transparent blur-[120px] rounded-full" />
      <div className="absolute top-[-40px] right-[15%] w-[320px] md:w-[550px] h-[250px] bg-gradient-to-tl from-[#059669]/15 via-[#6cbd2f]/8 to-transparent blur-[100px] rounded-full" />

      {/* Các icon rau củ bay lơ lửng nhẹ nhàng */}
      {decorItems.map((item, index) => (
        <motion.div
          key={index}
          className="absolute opacity-25 dark:opacity-15 text-[#6cbd2f]"
          style={{ top: item.top, left: item.left, right: item.right }}
          animate={{
            y: [0, -8, 0],
            rotate: [item.rotate, item.rotate + 6, item.rotate],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.2,
          }}
        >
          <div className={item.size}>
            <item.Icon size="1em" strokeWidth={1} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const Products = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const ITEMS_PER_PAGE = 25;

  // State Sort
  const [sortOption, setSortOption] = useState("default");
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Mapping ảnh cho từng Category giống bản cũ của bạn
  const categoryImages = {
    "All Products": "/all-products.png", // Bạn có thể thêm ảnh riêng cho nút "Tất cả" nếu muốn
    "Fresh Meat": "/meat123.png",
    Seafood: "/seafood.jpg",
    "Convenience Foods": "/egg.png",
    Fruits: "/apple.png",
    Vegetables: "/xalach.png",
    Packages: "/juice.png",
  };

  // Redux Store
  const { products, loading, totalProducts } = useSelector(
    (state) => state.product,
  );
  const { categories, selectedCategory } = useSelector(
    (state) => state.category,
  );

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const totalPages = useMemo(() => {
    if (!totalProducts) return 1;
    return Math.ceil(totalProducts / ITEMS_PER_PAGE);
  }, [totalProducts]);

  // 1. Gọi API danh mục
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // 2. Gọi API danh sách sản phẩm và tìm kiếm qua URL Parameter
  useEffect(() => {
    const fetchData = () => {
      const q = searchParams.get("q");
      const subCatId = searchParams.get("subCatId");
      const currentCategoryId =
        subCatId || (selectedCategory !== "All" ? selectedCategory : null);

      const apiParams = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        ...(currentCategoryId && { categoryId: currentCategoryId }),
      };

      if (q) {
        dispatch(searchProducts({ q: q, ...apiParams }));
      } else {
        const params = {
          ...(currentCategoryId && { categoryId: currentCategoryId }),
        };
        dispatch(fetchAllProducts(params));
      }
    };

    const timer = setTimeout(fetchData, 500);
    return () => clearTimeout(timer);
  }, [searchParams, selectedCategory, currentPage, dispatch]);

  // 3. Chuẩn hóa và map ảnh cho danh mục (Lọc level === 0)
  const displayCategories = useMemo(() => {
    if (!categories) return [];

    // Thêm lựa chọn "All Products" lên đầu danh sách Grid để user tiện bấm quay lại
    const allOption = { _id: "All", name: "All Products", image: "/apple.png" }; // Thay thế bằng ảnh "Tất cả sản phẩm" của bạn

    const rootCats = categories
      .filter((c) => c.level === 0)
      .map((cat) => ({
        ...cat,
        image: categoryImages[cat.name] || "/placeholder.png",
      }));

    return [allOption, ...rootCats];
  }, [categories]);

  // 4. Engine Sort local mượt mà
  const processedProducts = useMemo(() => {
    if (!products) return [];
    let result = [...products];

    if (sortOption === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === "rating-desc") {
      result.sort((a, b) => b.ratings - a.ratings);
    }

    return result;
  }, [products, sortOption]);

  const handlePageChange = (pageNumber) => {
    searchParams.set("page", pageNumber.toString());
    setSearchParams(searchParams);

    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleCategoryChange = (id) => {
    if (id === "All") {
      searchParams.delete("subCatId");
    } else {
      searchParams.set("subCatId", id);
    }
    setSearchParams(searchParams);
    dispatch(setCategory(id));
  };

  return (
    <main className="min-h-screen pt-0 md:pt-0 pb-24 bg-[#fafbfa] dark:bg-[#060606] transition-all duration-700 relative overflow-x-hidden">
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 relative z-10">
        {/* ================= LAYOUT 1: SECTION FRESHMART CĂN GIỮA + NEW GRID CATEGORY ================= */}
        <div className="flex flex-col items-center justify-center text-center relative mb-16 pt-16 select-none">
          {/* Hiệu ứng decor nền loang mượt mà */}
          <ElegantHeaderDecor />

          {/* 1. ĐỒNG BỘ 100% TIÊU ĐỀ THEO MẪU CỦA BỒ */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.6 }}
            viewport={{ once: true }}
            className="flex items-center gap-1.5 mb-1"
          >
            <span className="w-4 h-[1px] bg-[#77cd3a]" />
            <span className="uppercase tracking-[0.3em] text-[8px] font-black text-[#025c37] dark:text-[#77cd3af2]">
              Marketplace
            </span>
            <span className="w-4 h-[1px] bg-[#77cd3a]" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-light text-gray-900 dark:text-white tracking-tight leading-tight mb-8"
          >
            Fresh{" "}
            <span className="font-serif italic border-b border-[#77cd3af2]/30 text-[#025c37] dark:text-[#77cd3af2]">
              Market
            </span>
          </motion.h2>

          {/* 2. GRID VÒNG TRÒN - BẤM LÊN XANH DỊU NHẸ, KHÔNG BỊ ĐẬM QUÁ */}
          <div className="w-full max-w-3xl px-4 relative z-10">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-y-7 gap-x-2">
              {displayCategories.slice(0, 7).map((cat, index) => {
                const isActive = selectedCategory === cat._id;

                // Làm sạch text tinh gọn
                const cleanName = cat.name
                  .replace(" Products", "")
                  .replace(" Foods", "");

                return (
                  <motion.div
                    key={cat._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02, duration: 0.3 }}
                  >
                    <button
                      onClick={() => handleCategoryChange(cat._id)}
                      className="group relative flex flex-col items-center justify-center w-full cursor-pointer outline-none bg-transparent border-none"
                    >
                      {/* VÒNG TRÒN NỀN: Khi Active chỉ lên màu xanh bơ nhạt cực dịu mắt */}
                      <div
                        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isActive
                            ? "bg-[#77cd3a]/12 dark:bg-[#77cd3a]/18 scale-105 shadow-[0_8px_20px_rgba(119,205,58,0.06)]"
                            : "bg-neutral-100/50 dark:bg-neutral-900/30 text-neutral-800 dark:text-neutral-200 group-hover:bg-[#77cd3a]/5 group-hover:scale-105"
                        }`}
                      >
                        {/* Viền tròn siêu thanh mảnh tiệp màu khi Active */}
                        {isActive && (
                          <div className="absolute inset-0 rounded-full border border-[#77cd3a]/30 animate-pulse" />
                        )}

                        {/* Ảnh sản phẩm trôi lướt nhẹ nhàng khi Hover */}
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-[58%] h-[58%] object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.02)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:scale-108"
                        />
                      </div>

                      {/* CHỮ DANH MỤC: Đồng bộ font Fredoka siêu mướt mắt */}
                      <div className="mt-2.5 w-full text-center px-1 font-['Fredoka']">
                        <span
                          className={`text-[11px] sm:text-xs tracking-wide block transition-all duration-300 ${
                            isActive
                              ? "text-[#025c37] dark:text-[#77cd3af2] font-semibold scale-102"
                              : "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-800 dark:group-hover:text-neutral-200 font-medium"
                          }`}
                        >
                          {cleanName}
                        </span>
                      </div>

                      {/* Thanh gạch ngang mỏng dưới chân tương ứng màu chữ */}
                      <div
                        className={`h-[1.5px] bg-[#77cd3a] rounded-full mt-1 transition-all duration-300 ${
                          isActive
                            ? "w-3 opacity-100"
                            : "w-0 opacity-0 group-hover:w-1.5 group-hover:opacity-40"
                        }`}
                      />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
        {/* ================= LAYOUT 2: THANH SEARCH & SORT TINH GỌN (TỐI ƯU RESPONSIVE) ================= */}
        <div className="w-full bg-gradient-to-b from-transparent via-[#77cd3a]/5 to-transparent dark:from-transparent dark:via-[#77cd3a]/2 dark:to-transparent py-10 mb-8 font-['Fredoka'] select-none border-y border-neutral-100/50 dark:border-neutral-800/30">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* HÀNG ĐIỀU KHIỂN CHÍNH */}
            <div className="flex flex-col md:flex-row justify-between items-center w-full gap-6">
              {/* KHỐI BÊN TRÁI: SEARCH CHUẨN + QUICK TAGS GỢI Ý */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto flex-1 max-w-2xl">
                {/* THANH SEARCH TRẦN HỘP KÍNH */}
                <div className="relative flex items-center w-full sm:w-[280px] md:w-[320px] h-11 bg-white/90 dark:bg-neutral-900/80 border border-neutral-200/50 dark:border-neutral-800/60 rounded-full px-4 focus-within:border-[#77cd3a] focus-within:bg-white dark:focus-within:bg-neutral-900 focus-within:shadow-[0_8px_25px_rgba(119,205,58,0.05)] transition-all duration-300 group backdrop-blur-md">
                  <Search
                    size={14}
                    className="text-neutral-400 group-focus-within:text-[#77cd3a] transition-colors shrink-0"
                  />
                  <input
                    type="text"
                    placeholder="Search fresh products..."
                    value={searchParams.get("q") || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) searchParams.set("q", val);
                      else searchParams.delete("q");
                      setSearchParams(searchParams);
                    }}
                    className="bg-transparent border-none outline-none pl-2.5 pr-8 text-xs w-full text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 font-medium tracking-wide"
                  />

                  {searchParams.get("q") && (
                    <button
                      onClick={() => {
                        searchParams.delete("q");
                        setSearchParams(searchParams);
                      }}
                      className="absolute right-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* CỤM TỪ KHÓA GỢI Ý (QUICK TAGS) - Lấp đầy khoảng trống bên trái */}
                <div className="hidden sm:flex items-center gap-2.5 text-[11px] text-neutral-400 font-medium whitespace-nowrap">
                  <span className="opacity-60">Suggest:</span>
                  {["Organic", "Fresh", "Sale"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        searchParams.set("q", tag.toLowerCase());
                        setSearchParams(searchParams);
                      }}
                      className="px-2.5 py-1 bg-white/40 dark:bg-neutral-800/30 hover:bg-[#77cd3a]/10 hover:text-[#025c37] dark:hover:text-[#77cd3af2] rounded-full transition-all duration-200 border border-neutral-200/20 dark:border-neutral-700/20 cursor-pointer"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* KHỐI BÊN PHẢI: CHỌN CHẾ ĐỘ XEM LAYOUT + NÚT SORT */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end shrink-0">
                {/* NÚT ĐỔI PHONG CÁCH GRID (VIEW TOGGLE) - Lấp đầy khoảng trống bên phải */}
                <div className="hidden xs:flex items-center gap-1 bg-neutral-100/60 dark:bg-neutral-800/40 p-1 rounded-full border border-neutral-200/30 dark:border-neutral-700/20">
                  <button
                    onClick={() => {
                      /* Hàm set Grid 3 cột ở đây bồ tự gắn nha */
                    }}
                    className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                    title="3 Columns Grid"
                  >
                    <LayoutGrid size={13} />
                  </button>
                  <div className="w-[1px] h-3 bg-neutral-200 dark:bg-neutral-700" />
                  <button
                    onClick={() => {
                      /* Hàm set Grid 4 cột ở đây */
                    }}
                    className="p-1.5 rounded-full text-[#77cd3a] bg-white dark:bg-neutral-900 shadow-sm transition-all cursor-pointer"
                    title="4 Columns Grid"
                  >
                    <Grid3X3 size={13} />
                  </button>
                </div>

                {/* NÚT SORT TRẦN ĐỒNG ĐIỆU */}
                <div className="relative">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className={`flex items-center gap-2 h-11 bg-white/90 dark:bg-neutral-900/80 border rounded-full px-4 text-xs font-medium tracking-wide text-neutral-600 dark:text-neutral-300 transition-all duration-300 cursor-pointer select-none ${
                      isSortOpen
                        ? "border-[#77cd3a] text-[#025c37] dark:text-[#77cd3af2] shadow-[0_8px_25px_rgba(119,205,58,0.05)]"
                        : "border-neutral-200/50 dark:border-neutral-800/60 hover:border-[#77cd3a]/60"
                    }`}
                  >
                    <ArrowUpDown
                      size={12}
                      className={
                        isSortOpen ? "text-[#77cd3a]" : "text-neutral-400"
                      }
                    />
                    <span className="text-neutral-400">Sort:</span>
                    <span
                      className={
                        isSortOpen
                          ? "text-[#025c37] dark:text-[#77cd3af2] font-semibold"
                          : "text-neutral-800 dark:text-neutral-200"
                      }
                    >
                      {sortOption === "default" && "Default"}
                      {sortOption === "price-asc" && "Low to High"}
                      {sortOption === "price-desc" && "High to Low"}
                      {sortOption === "rating-desc" && "Top Ratings"}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isSortOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40 cursor-default"
                          onClick={() => setIsSortOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-[115%] w-48 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/60 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] z-50 overflow-hidden p-1 backdrop-blur-md"
                        >
                          {[
                            { id: "default", label: "Default" },
                            { id: "price-asc", label: "Price: Low to High" },
                            { id: "price-desc", label: "Price: High to Low" },
                            { id: "rating-desc", label: "Top Ratings" },
                          ].map((opt) => {
                            const isSelected = sortOption === opt.id;
                            return (
                              <button
                                key={opt.id}
                                onClick={() => {
                                  setSortOption(opt.id);
                                  setIsSortOpen(false);
                                }}
                                className={`w-full text-left px-3.5 h-8 flex items-center rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-[#77cd3a]/10 text-[#025c37] dark:text-[#77cd3af2] font-semibold"
                                    : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-white/5 hover:text-neutral-800 dark:hover:text-neutral-200"
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ================= LAYOUT 3: GRID SẢN PHẨM ================= */}
        <section className="min-h-[500px]">
          {loading ? (
            <FruitLoader />
          ) : processedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 sm:gap-x-6 gap-y-8 sm:gap-y-12">
              <AnimatePresence mode="popLayout">
                {processedProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <NoProductsFound
              onReset={() => {
                setSearchParams({});
                dispatch(setCategory("All"));
                setSortOption("default");
              }}
            />
          )}
        </section>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* INJECT ANIMATION CSS */}
      <style>{`
        .custom-responsive-float {
          animation: responsiveFloat 4s ease-in-out infinite;
          will-change: transform;
          transform: translateZ(0);
          transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
        }

        @media (min-width: 1024px) {
          .group:hover .custom-responsive-float {
            transform: scale3d(1.1, 1.1, 1) translate3d(0, -5px, 0) !important;
            animation-play-state: paused;
          }
        }

        @keyframes responsiveFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -4px, 0);
          }
        }
      `}</style>
    </main>
  );
};

export default Products;
