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
import { fetchAllProducts } from "../store/slices/productSlice";
import { useLocation } from "react-router-dom";
import { fetchCategories, setCategory } from "../store/slices/categorySlice";

const Products = () => {
  const dispatch = useDispatch();
  const { search: urlSearch } = useLocation(); //?subcategory=Potato

  // State Local
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState(null);
  const initialFilters = {
    rating: null,
    stock: "all",
    maxPrice: 150,
    subcategory: "",
    search: "",
  };
  const [filters, setFilters] = useState(initialFilters);

  // Redux Store
  const { products, loading } = useSelector((state) => state.product);
  const { categories, selectedCategory } = useSelector(
    (state) => state.category,
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Fetch Products
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = {
        ...(selectedCategory !== "All" && { categoryId: selectedCategory }),
        ...(filters.search.trim() !== "" && { search: filters.search }),
      };
      dispatch(fetchAllProducts(params));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [selectedCategory, filters.search, dispatch]);

  // Handle logic URL
  useEffect(() => {
    setFilters(initialFilters);
    const params = new URLSearchParams(urlSearch);
    const subcatId = params.get("subCatId"); // Giả sử URL truyền ID
    if (subcatId) {
      dispatch(setCategory(subcatId));
    } else {
      dispatch(setCategory("All"));
    }
  }, [urlSearch, dispatch]);

  // Filter Client-side
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
  }, [products, filters.rating, filters.maxPrice, filters.stock]);

  return (
    <main className="min-h-screen pt-32 pb-24 bg-white dark:bg-[#060606] transition-all duration-700">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* HEADER */}
        <header className="mb-16 flex items-baseline justify-between border-b border-gray-100 dark:border-white/5 pb-10">
          <h1 className="text-5xl font-extralight tracking-tighter uppercase dark:text-white">
            Fresh{" "}
            <span className="font-serif italic lowercase text-gray-400">
              Market
            </span>
          </h1>
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-2 text-[#77cd3a] text-[10px] font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
          >
            <Sparkles size={14} /> AI Assistant
          </button>
        </header>

        {/* FILTER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 relative border-y border-gray-100 dark:border-white/5 py-8">
          <div className="flex gap-10 overflow-x-auto no-scrollbar">
            <button
              onClick={() => dispatch(setCategory("All"))}
              className={selectedCategory === "All" ? "active" : ""}
            >
              All
            </button>

            {categories
              .filter((c) => c.level === 0)
              .map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => dispatch(setCategory(cat._id))} // Gửi ID lên store
                  className={
                    selectedCategory === cat._id
                      ? "text-[#77cd3a] font-bold"
                      : ""
                  }
                >
                  {cat.name}
                </button>
              ))}
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search
                size={18}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#77cd3a]"
              />
              <input
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="bg-transparent border-none outline-none pl-6 text-sm w-32 focus:w-48 transition-all dark:text-white"
              />
            </div>

            {/* Rating Dropdown Đã tách */}
            <RatingDropdown
              filters={filters}
              setFilters={setFilters}
              isOpen={openFilter === "rating"}
              setOpen={() =>
                setOpenFilter(openFilter === "rating" ? null : "rating")
              }
            />

            <button
              onClick={() =>
                setOpenFilter(openFilter === "more" ? null : "more")
              }
              className={`p-2 rounded-full border transition-all ${openFilter === "more" ? "border-[#77cd3a] text-[#77cd3a]" : "border-gray-100 dark:border-white/5 text-gray-400"}`}
            >
              <SlidersHorizontal size={14} />
            </button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center items-center py-40 text-center col-span-full"
                >
                  <p className="text-[11px] uppercase tracking-[0.5em] text-[#77cd3a] animate-pulse">
                    Harvesting{" "} our products...
                  </p>
                </motion.div>
              ) : (
                filteredProducts.map((product) => (
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
                ))
              )}
            </AnimatePresence>
          </div>
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
