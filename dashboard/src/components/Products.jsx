import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  LoaderCircle, Plus, Search, Filter, 
  Edit3, Trash2, Eye, ShoppingBasket,
  ChevronLeft, ChevronRight 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Actions & Modals
import { fetchAllProducts, deleteProduct } from "../store/slices/productsSlice";
import { 
  toggleCreateProductModal, 
  toggleUpdateProductModal, 
  toggleViewProductModal 
} from "../store/slices/extraSlice";

import CreateProductModal from "../modals/CreateProductModal";
import UpdateProductModal from "../modals/UpdateProductModal";
import ViewProductModal from "../modals/ViewProductModal";
import FloatingVegetables from "../components/Fruit/FloatingVegetables";

const Products = () => {
  const dispatch = useDispatch();
  
  // Lấy dữ liệu từ Redux - Đã sửa tên biến khớp với extraSlice của ní (có "ed")
  const { products, loading } = useSelector((state) => state.product);
  const { 
    isCreateProductModalOpened, 
    isUpdateProductModalOpened, 
    isViewProductModalOpened 
  } = useSelector((state) => state.extra);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // --- LOGIC PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  // Reset về trang 1 khi tìm kiếm hoặc lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  const filteredProducts = products?.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts?.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((filteredProducts?.length || 0) / itemsPerPage);

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
              Fresh <span className="text-[#77cd3af2] font-serif italic font-normal">Inventory</span>
            </h1> 
            <p className="text-gray-400 text-[10px] font-black mt-1 tracking-[0.3em] uppercase">
               Garden Status: {filteredProducts?.length} Items Available
            </p>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(toggleCreateProductModal())}
            className="flex items-center gap-2 px-8 py-4 bg-[#77cd3af2] text-white rounded-[25px] font-bold shadow-lg shadow-green-100 transition-all"
          >
            <Plus size={20} /> <span>Harvest New Product</span>
          </motion.button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap gap-4 mb-10">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input 
              type="text" placeholder="Search products..."
              className="w-full pl-14 pr-6 py-4 bg-white border-none rounded-[25px] shadow-sm focus:ring-4 focus:ring-[#77cd3a10] outline-none text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 bg-white px-6 rounded-[25px] shadow-sm border border-gray-50">
            <Filter size={18} className="text-[#77cd3af2]" />
            <select 
              className="py-4 bg-transparent border-none outline-none text-xs font-black text-gray-500 uppercase tracking-widest cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Fruits">Fruits</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Packages">Packages</option>
              <option value="Meats">Meats</option>
              <option value="Seafoods">Seafoods</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <LoaderCircle className="w-12 h-12 text-[#77cd3af2] animate-spin" />
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest italic">Gathering Freshness...</p>
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
                    {/* Image */}
                    <div className="relative h-52 w-full mb-6 rounded-[30px] overflow-hidden bg-gray-50">
                      <img 
                        src={product.images[0]?.url} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>

                    {/* Info */}
                    <div className="px-2">
                      <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-2xl font-black text-[#77cd3af2]">${product.price}</span>
                        <span className="text-[10px] font-bold text-gray-300 italic">Stock: {product.stock}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 border-t border-gray-50 pt-5">
                        <button onClick={() => handleView(product)} className="flex-1 flex justify-center py-3 bg-gray-50 text-gray-400 rounded-[18px] hover:bg-gray-800 hover:text-white transition-all">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => handleEdit(product)} className="flex-1 flex justify-center py-3 bg-gray-50 text-gray-400 rounded-[18px] hover:bg-[#77cd3af2] hover:text-white transition-all">
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="flex-1 flex justify-center py-3 bg-red-50 text-red-400 rounded-[18px] hover:bg-red-500 hover:text-white transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-16">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-4 bg-white rounded-full shadow-sm disabled:opacity-30 hover:bg-[#77cd3af2] hover:text-white transition-all text-gray-400"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-12 h-12 rounded-full font-bold text-sm transition-all ${
                        currentPage === i + 1 
                        ? "bg-[#77cd3af2] text-white shadow-lg shadow-green-100 scale-110" 
                        : "bg-white text-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-4 bg-white rounded-full shadow-sm disabled:opacity-30 hover:bg-[#77cd3af2] hover:text-white transition-all text-gray-400"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && filteredProducts?.length === 0 && (
          <div className="text-center py-40 bg-white rounded-[50px] border border-dashed border-gray-100">
            <ShoppingBasket className="mx-auto text-gray-200 mb-4" size={60} />
            <p className="text-gray-400 italic">No fresh products found in this garden.</p>
          </div>
        )}
      </main>

      {/* Modals - ĐÃ SỬA: Tên biến khớp với extraSlice có chữ "ed" */}
      <AnimatePresence>
        {isCreateProductModalOpened && <CreateProductModal />}
        {isUpdateProductModalOpened && <UpdateProductModal selectedProduct={selectedProduct} />}
        {isViewProductModalOpened && <ViewProductModal selectedProduct={selectedProduct} />}
      </AnimatePresence>
    </div>
  );
};

export default Products;