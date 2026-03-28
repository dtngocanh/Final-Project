import React, { useState, useMemo } from "react";
import { Search, Sparkles, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Components đã tách
import ProductCard from "../components/Products/ProductCard";
import Pagination from "../components/Products/Pagination";
import AISearchModal from "../components/Products/AISearchModal";
import RatingDropdown from "../components/Products/RatingDropdown";
import ExpandedFilter from "../components/Products/ExpandedFilter"; // Nhớ tạo file này nhé

const MOCK_PRODUCTS = Array.from({ length: 24 }).map((_, i) => ({
  _id: `${i + 1}`,
  name: ["Mango", "Broccoli", "Salad", "Cherry", "Peach", "Apple"][i % 6],
  image: ["/mango.png", "/broli.png", "/xalach.png", "/cheri1.png", "/peach.png", "/apple.png"][i % 6],
  price: Math.floor(Math.random() * 100) + 10,
  ratings: (Math.random() * (5 - 3) + 3).toFixed(1),
  category: ["Fruits", "Vegetables", "Organic", "Seasons"][i % 4],
  stock: i % 8 === 0 ? 0 : 10,
}));

// PHẢI CÓ DÒNG NÀY Ở NGOÀI
const categories = ["All", "Fruits", "Vegetables", "Organic"];

const Products = () => {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState(null); 
  const [filters, setFilters] = useState({
    category: "All",
    rating: null,
    stock: "all",
    maxPrice: 150,
    search: "",
  });

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => {
      const matchCat = filters.category === "All" || p.category === filters.category;
      const matchStar = filters.rating ? Math.floor(p.ratings) >= filters.rating : true;
      const matchPrice = p.price <= filters.maxPrice;
      const matchStock = filters.stock === "all" ? true : filters.stock === "in" ? p.stock > 0 : p.stock === 0;
      const matchSearch = p.name.toLowerCase().includes(filters.search.toLowerCase());
      return matchCat && matchStar && matchPrice && matchStock && matchSearch;
    });
  }, [filters]);

  return (
    <main className="min-h-screen pt-32 pb-24 bg-white dark:bg-[#060606] transition-all duration-700">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* HEADER */}
        <header className="mb-16 flex items-baseline justify-between border-b border-gray-100 dark:border-white/5 pb-10">
          <h1 className="text-5xl font-extralight tracking-tighter uppercase dark:text-white">
            Hehehehe <span className="font-serif italic lowercase text-gray-400">Market</span>
          </h1>
          <button onClick={() => setIsAIModalOpen(true)} className="flex items-center gap-2 text-[#77cd3a] text-[10px] font-bold uppercase tracking-widest hover:opacity-70 transition-opacity">
            <Sparkles size={14} /> AI Assistant
          </button>
        </header>

        {/* FILTER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 relative border-y border-gray-100 dark:border-white/5 py-8">
          
          <div className="flex gap-10 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilters({ ...filters, category: cat })}
                className={`text-sm uppercase tracking-[0.2em] pb-1 transition-all whitespace-nowrap ${
                  filters.category === cat ? "text-[#77cd3a] border-b-2 border-[#77cd3a] font-black" : "text-gray-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#77cd3a]" />
              <input
                type="text"
                placeholder="Search..."
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="bg-transparent border-none outline-none pl-6 text-sm w-32 focus:w-48 transition-all dark:text-white"
              />
            </div>

            {/* Rating Dropdown Đã tách */}
            <RatingDropdown 
              filters={filters} 
              setFilters={setFilters} 
              isOpen={openFilter === "rating"}
              setOpen={() => setOpenFilter(openFilter === "rating" ? null : "rating")}
            />

            <button
              onClick={() => setOpenFilter(openFilter === "more" ? null : "more")}
              className={`p-2 rounded-full border transition-all ${openFilter === 'more' ? 'border-[#77cd3a] text-[#77cd3a]' : 'border-gray-100 dark:border-white/5 text-gray-400'}`}
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
              {filteredProducts.map((product) => (
                <motion.div key={product._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {filteredProducts.length === 0 && (
            <p className="text-center py-20 font-serif italic text-gray-500 text-xl">Quietness... No products found.</p>
          )}
        </section>

        <Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />
      </div>

      {isAIModalOpen && <AISearchModal onClose={() => setIsAIModalOpen(false)} />}
    </main>
  );
};

export default Products;