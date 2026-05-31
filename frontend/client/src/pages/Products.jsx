import React, { useState, useMemo } from "react";
import { Search, Sparkles, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Components
import ProductCard from "../components/Products/ProductCard";
import Pagination from "../components/Products/Pagination";
import AISearchModal from "../components/Products/AISearchModal";
import RatingDropdown from "../components/Products/RatingDropdown";
import ExpandedFilter from "../components/Products/ExpandedFilter"; // Nhớ tạo file này nhé

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

// Store actions
import { fetchAllProducts, searchProducts } from "../store/slices/productSlice";
import { useLocation, useSearchParams } from "react-router-dom";
import { fetchCategories, setCategory } from "../store/slices/categorySlice";
import { NoProductsFound } from "../components/Products/NoProductsFound";
import FruitLoader from "../components/Fruit/FruitLoader";

const Products = () => {
  const dispatch = useDispatch();
  const location = useLocation(); //?subcategory=Potato

  const [searchParams, setSearchParams] = useSearchParams();
  // State Local
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState(null);
  const initialFilters = {
    rating: null,
    stock: "all",
    maxPrice: 150,
    // subcategory: "",
    // search: "",
  };
  const [filters, setFilters] = useState(initialFilters);

  // Redux Store
  const { products, loading } = useSelector((state) => state.product);
  const { categories, selectedCategory } = useSelector(
    (state) => state.category,
  );
  // 1. Gọi API hiển thị dm
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // 2. Gọi API hiển thị ds sp và tìm kiếm
  useEffect(() => {
    const fetchData = () => {
      const q = searchParams.get("q"); // Lấy q từ URL
      const subCatId = searchParams.get("subCatId");

      const currentCategoryId =
        subCatId || (selectedCategory !== "All" ? selectedCategory : null);

      if (q) {
        dispatch(
          searchProducts({
            q: q,
            categoryId: currentCategoryId,
          }),
        );
      } else {
        const params = {
          ...(currentCategoryId && { categoryId: currentCategoryId }),
        };

        dispatch(fetchAllProducts(params));
      }
    };

    const timer = setTimeout(fetchData, 500);
    return () => clearTimeout(timer);
  }, [searchParams, selectedCategory, dispatch]);

  // 3. Hàm lọc
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchStar = filters.rating
        ? Math.floor(p.ratings) >= filters.rating
        : true;
      const matchPrice = p.price <= filters.maxPrice;
      const matchStock =
        filters.stock === "all"
          ? true
          : filters.stock === "in"
            ? p.stock > 0
            : p.stock === 0;
      return matchStar && matchPrice && matchStock;
    });
  }, [products, filters]);

  // 4. Hàm xử lý khi chọn Category (Cập nhật URL thay vì chỉ dispatch)
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
    <main className="min-h-screen pt-32 pb-24 bg-white dark:bg-[#060606] transition-all duration-700">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* HEADER */}
        <header className="mb-12 flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-8">
          {/* LOGO: Tối giản, tinh tế, hạ size để sang trọng hơn */}
          <h1 className="text-4xl text-[#77cd3a] font-extralight tracking-wide uppercase text-neutral-800 dark:text-neutral-100">
            <span className="text-[#77cd3a] ml-1">
              FreshMart
            </span>
          </h1>

          {/* BUTTON AI: Dạng Text-Link cao cấp, ẩn mình tinh tế và chuyển màu mượt mà khi hover */}
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="group flex items-center gap-2 text-xs font-semibold tracking-widest text-neutral-400 hover:text-[#77cd3a] transition-colors duration-300"
          >
            <Sparkles
              size={14}
              className="text-neutral-300 group-hover:text-[#77cd3a] transition-all duration-300 group-hover:scale-110"
            />
            <span className="uppercase text-[11px]">AI Assistant</span>
            {/* Chấm xanh pulse nhẹ báo hiệu tính năng thông minh sẵn sàng */}
            <span className="h-1.5 w-1.5 rounded-full bg-[#77cd3a] opacity-80 group-hover:animate-ping" />
          </button>
        </header>

        {/* FILTER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative border-y border-gray-100 dark:border-white/5 py-6">
          {/* Left: Categories Menu */}
          <div className="flex items-center text-sm gap-8 overflow-x-auto no-scrollbar scroll-smooth">
            <button
              onClick={() => handleCategoryChange("All")}
              className={`whitespace-nowrap pb-1 border-b-2 transition-all duration-300 uppercase tracking-wider text-xs font-medium ${
                selectedCategory === "All"
                  ? "border-[#77cd3a] text-[#77cd3a] font-bold"
                  : "border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              }`}
            >
              All Products
            </button>

            {categories
              .filter((c) => c.level === 0)
              .map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryChange(cat._id)}
                  className={`whitespace-nowrap pb-1 border-b-2 transition-all duration-300 uppercase tracking-wider text-xs font-medium ${
                    selectedCategory === cat._id
                      ? "border-[#77cd3a] text-[#77cd3a] font-bold"
                      : "border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
          </div>

          {/* Right: Actions Controls */}
          <div className="flex items-center justify-between md:justify-end gap-5">
            {/* Search Box: Thiết kế dạng line sang trọng, mở rộng nhẹ nhàng khi focus */}
            <div className="relative flex items-center border-b border-gray-200 dark:border-white/10 focus-within:border-[#77cd3a] py-1 transition-all duration-300">
              <Search
                size={16}
                className="text-neutral-400 transition-colors duration-300 group-focus-within:text-[#77cd3a]"
              />
              <input
                type="text"
                placeholder="Search product..."
                value={filters.search || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    searchParams.set("q", val);
                  } else {
                    searchParams.delete("q");
                  }
                  setSearchParams(searchParams);
                }}
                className="bg-transparent border-none outline-none pl-3 text-xs w-28 focus:w-40 transition-all duration-300 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 font-medium"
              />
            </div>

            {/* Controls Group */}
            <div className="flex items-center gap-3">
              {/* Rating Dropdown component */}
              <RatingDropdown
                filters={filters}
                setFilters={setFilters}
                isOpen={openFilter === "rating"}
                setOpen={() =>
                  setOpenFilter(openFilter === "rating" ? null : "rating")
                }
              />

              {/* Advanced Filter Toggle Button */}
              <button
                onClick={() =>
                  setOpenFilter(openFilter === "more" ? null : "more")
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium tracking-wide transition-all duration-300 ${
                  openFilter === "more"
                    ? "border-[#77cd3a] bg-[#77cd3a]/5 text-[#77cd3a]"
                    : "border-neutral-200 dark:border-white/10 text-neutral-500 hover:border-neutral-400 dark:text-neutral-400 dark:hover:border-neutral-200"
                }`}
              >
                <SlidersHorizontal size={12} />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Expanded Panel Đã tách */}
          <AnimatePresence>
            {openFilter === "more" && (
              <ExpandedFilter
                filters={filters}
                setFilters={setFilters}
                onClose={() => setOpenFilter(null)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* GRID */}
        <section className="min-h-[500px]">
          {loading ? (
            // <div className="flex justify-center items-center py-40 text-center col-span-full">
            <FruitLoader />
          ) : // </div>
          filteredProducts.length > 0 ? (
            /* Chỉ render thẻ div grid khi CÓ sản phẩm */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
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
                setFilters(initialFilters);
              }}
            />
          )}
        </section>

        <Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />
      </div>

      {isAIModalOpen && (
        <AISearchModal onClose={() => setIsAIModalOpen(false)} />
      )}
    </main>
  );
};

export default Products;
