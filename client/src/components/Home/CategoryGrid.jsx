import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../store/slices/categorySlice";
const floatingVariants = {
  initial: { y: 0 },
  animate: {
    y: [0, -15, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
const CategoryGrid = () => {
  const categoryImages = {
    "Meats and Seafood": "/seafood.png",
    Fruits: "/apple.png",
    Vegetables: "/xalach.png",
    Packages: "/juice.png",
  };

  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const displayCat = useMemo(() => {
    if (!categories) return [];
    return categories.map((cat) => ({
      ...cat,
      image: categoryImages[cat.name] || "/placeholder.png",
    }));
  }, [categories]);

  if (displayCat.length === 0) return null;

  return (
    <section className="relative py-24 bg-white dark:bg-[#0a0a0a] transition-colors duration-700 overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-[#77cd3a]/10 rounded-full blur-[120px] dark:opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* HEADER: MINIMAL ENGLISH STYLE */}
        <div className="flex flex-col items-center mb-20 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.6 }}
            className="flex items-center gap-3 mb-4"
          >
            <span className="w-8 h-[1px] bg-[#77cd3a]" />
            <span className="uppercase tracking-[0.5em] text-[10px] font-black text-[#025c37] dark:text-[#77cd3af2]">
              Marketplace
            </span>
            <span className="w-8 h-[1px] bg-[#77cd3a]" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white tracking-tight leading-tight"
          >
            Organic <br />
            <span className="font-serif italic border-b-2 border-[#77cd3af2]/30 text-[#025c37] dark:text-[#77cd3af2]">
              Selection
            </span>
          </motion.h2>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayCat.map((cat, index) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Link
                to={`/products?subCatId=${cat._id}`}
                className="group relative block"
              >
                {/* CARD BOX */}
                <div className="relative aspect-square overflow-hidden bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-8 transition-all duration-500 group-hover:border-[#77cd3af2]/40 group-hover:shadow-[0_0_50px_rgba(119,205,58,0.1)]">
                  {/* Image Container */}
                  <div className="relative h-[85%] w-full flex items-center justify-center">
                    <motion.img
                      src={cat.image || categoryImages[cat.name] || "image"}
                      alt={cat.name}
                      className="max-h-full max-w-full object-contain drop-shadow-2xl"
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, index % 2 === 0 ? 2 : -2, 0], // Xoay nhẹ trái phải tùy vị trí
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.2, // Tạo độ lệch thời gian để không nhảy cùng lúc
                      }}
                      whileHover={{
                        scale: 1.2,
                        rotate: [0, -10, 10, -10, 0], // (Wobble)
                        y: -20, // Nhảy vọt lên
                      }}

                    />
                  </div>

                  {/* Label & Line */}
                  <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                    <span className="text-lg tracking-wide text-gray-800 dark:text-gray-200 group-hover:text-[#77cd3a] transition-colors duration-300">
                      {cat.name}
                    </span>

                    {/* Animated Line */}
                    <div className="ml-4 h-[1px] flex-grow bg-gray-200 dark:bg-white/10 relative overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-[#77cd3a]"
                        initial={{ x: "-101%" }}
                        whileHover={{ x: "0%" }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* BOTTOM ACTION */}
        <div className="mt-16 flex justify-center">
          <Link
            to="/products"
            className="group flex items-center gap-4 px-8 py-3 rounded-full border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 hover:bg-[#77cd3a] transition-all duration-500"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] group-hover:text-white dark:text-white">
              View All Categories
            </span>
            <div className="w-6 h-6 rounded-full bg-white dark:bg-[#0a0a0a] flex items-center justify-center group-hover:translate-x-2 transition-transform duration-500">
              <svg
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
                className="stroke-black dark:stroke-white"
              >
                <path
                  d="M1 11L11 1M11 1H1M11 1V11"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
