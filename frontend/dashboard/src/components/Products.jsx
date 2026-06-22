import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  ShoppingBasket,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Actions & Modals
import { fetchAllProducts, deleteProduct } from "../store/slices/productsSlice";
import { fetchCategories, setCategory } from "../store/slices/categorySlice";
import {
  toggleCreateProductModal,
  toggleUpdateProductModal,
  toggleViewProductModal,
  toggleImportProductModal,
} from "../store/slices/extraSlice";

import CreateProductModal from "../modals/CreateProductModal";
import UpdateProductModal from "../modals/UpdateProductModal";
import ViewProductModal from "../modals/ViewProductModal";
import FloatingVegetables from "../components/Fruit/FloatingVegetables";
import ImportProductModal from "../modals/ImportProductModal";
import FruitLoader from "./Fruit/FruitLoader"; // Import FruitLoader giống bên Orders

const Products = () => {
  const dispatch = useDispatch();

  const { products, loading, totalProducts } = useSelector(
    (state) => state.product,
  );
  const { categories, selectedCategory } = useSelector(
    (state) => state.category,
  );
  const {
    isCreateProductModalOpened,
    isUpdateProductModalOpened,
    isViewProductModalOpened,
    isImportProductModalOpened,
  } = useSelector((state) => state.extra);

  // State UI
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [filters, setFilters] = useState({ search: "" });

  useEffect(() => {
    const filterParams = {
      page: currentPage,
      limit: itemsPerPage,
      categoryId: selectedCategory !== "All" ? selectedCategory : undefined,
    };
    dispatch(fetchAllProducts(filterParams));
  }, [dispatch, selectedCategory, currentPage]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, selectedCategory]);

  const totalItems = totalProducts || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = products || [];

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // Handlers
  const handleView = (product) => {
    setSelectedProduct(product);
    dispatch(toggleViewProductModal());
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    dispatch(toggleUpdateProductModal());
  };

  const handleDelete = (id) => {
    if (window.confirm("Ní có chắc muốn xóa món hàng tươi ngon này không?")) {
      dispatch(deleteProduct(id));
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfd] font-['Fredoka'] relative overflow-hidden pb-20">
      <FloatingVegetables activeColor="#77cd3af2" />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-10">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-light text-gray-800">
              Fresh{" "}
              <span className="text-[#77cd3af2] font-serif italic font-normal">
                Inventory
              </span>
            </h1>
            <p className="text-gray-400 text-[10px] font-black mt-1 tracking-[0.3em] uppercase">
              Garden Status: {totalItems} Items Available
            </p>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch(toggleImportProductModal())}
              className="flex items-center gap-2 px-6 py-4 bg-white border-2 border-[#77cd3af2] text-[#77cd3af2] rounded-[25px] font-bold shadow-sm transition-all"
            >
              <ShoppingBasket size={20} /> <span>Import List</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch(toggleCreateProductModal())}
              className="flex items-center gap-2 px-8 py-4 bg-[#77cd3af2] text-white rounded-[25px] font-bold shadow-lg shadow-green-100 transition-all"
            >
              <Plus size={20} /> <span>Harvest New Product</span>
            </motion.button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap gap-4 mb-10">
          <div className="relative flex-1 min-w-[300px]">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"
              size={20}
              onClick={() => {
                dispatch(
                  fetchAllProducts({
                    page: 1,
                    limit: itemsPerPage,
                    search: filters.search,
                    categoryId:
                      selectedCategory !== "All" ? selectedCategory : undefined,
                  }),
                );
                setCurrentPage(1);
              }}
            />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-14 pr-6 py-4 bg-white border-none rounded-[25px] shadow-sm focus:ring-4 focus:ring-[#77cd3a10] outline-none text-sm transition-all"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  dispatch(
                    fetchAllProducts({
                      page: 1,
                      limit: itemsPerPage,
                      search: filters.search,
                      categoryId:
                        selectedCategory !== "All"
                          ? selectedCategory
                          : undefined,
                    }),
                  );
                  setCurrentPage(1);
                }
              }}
            />
          </div>

          <div className="flex items-center gap-3 bg-white px-6 rounded-[25px] shadow-sm border border-gray-50">
            <Filter size={18} className="text-[#77cd3af2]" />
            <select
              className="py-4 bg-transparent border-none outline-none text-xs font-black text-gray-500 uppercase tracking-widest cursor-pointer"
              value={selectedCategory}
              onChange={(e) => dispatch(setCategory(e.target.value))}
            >
              <option value="All">All Categories</option>
              {categories
                ?.filter((c) => c.level === 0)
                .map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Products Grid Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <FruitLoader />
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest italic mt-4">
              Gathering Freshness...
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {currentItems?.map((product) => (
                  <motion.div
                    layout
                    key={product._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group bg-white rounded-[40px] p-5 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 border border-transparent hover:border-white relative"
                  >
                    <div className="relative h-52 w-full mb-6 rounded-[30px] overflow-hidden bg-gray-50">
                      <img
                        src={product.images[0]?.url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>

                    <div className="px-2">
                      <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-2xl font-black text-[#77cd3af2]">
                          ${product.price}
                        </span>
                        <span className="text-[10px] font-bold text-gray-300 italic">
                          Stock: {product.stock}
                        </span>
                      </div>

                      <div className="flex gap-2 border-t border-gray-50 pt-5">
                        <button
                          onClick={() => handleView(product)}
                          className="flex-1 flex justify-center py-3 bg-gray-50 text-gray-400 rounded-[18px] hover:bg-gray-800 hover:text-white transition-all"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="flex-1 flex justify-center py-3 bg-gray-50 text-gray-400 rounded-[18px] hover:bg-[#77cd3af2] hover:text-white transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="flex-1 flex justify-center py-3 bg-red-50 text-red-400 rounded-[18px] hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-16 px-2 gap-4">
                {/* Phần hiển thị số trang bên trái */}
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Page{" "}
                  <span className="text-gray-800 text-sm">{currentPage}</span> /{" "}
                  {totalPages}
                </p>

                {/* Cụm nút bấm căn về bên phải */}
                <div className="flex items-center gap-2">
                  {/* Nút Back */}
                  <button
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className="w-12 h-12 flex items-center justify-center bg-white rounded-[20px] shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-all text-gray-400 border border-gray-50"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {/* Danh sách số trang có dấu ... */}
                  <div className="flex items-center gap-2">
                    {renderPageNumbers().map((p, i) =>
                      p === "..." ? (
                        <span key={i} className="text-gray-300 px-1 font-bold">
                          ...
                        </span>
                      ) : (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(p)}
                          className={`w-12 h-12 rounded-[20px] font-bold text-sm transition-all ${
                            currentPage === p
                              ? "bg-[#77cd3af2] text-white shadow-lg shadow-green-100 scale-105"
                              : "bg-white text-gray-400 hover:bg-gray-50 border border-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  </div>

                  {/* Nút Next */}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className="w-12 h-12 flex items-center justify-center bg-white rounded-[20px] shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-all text-gray-400 border border-gray-50"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isCreateProductModalOpened && <CreateProductModal />}
        {isUpdateProductModalOpened && (
          <UpdateProductModal selectedProduct={selectedProduct} />
        )}
        {isViewProductModalOpened && (
          <ViewProductModal selectedProduct={selectedProduct} />
        )}
        {isImportProductModalOpened && <ImportProductModal />}
      </AnimatePresence>
    </div>
  );
};

export default Products;
