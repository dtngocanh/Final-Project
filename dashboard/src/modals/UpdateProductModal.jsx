import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleUpdateProductModal } from "../store/slices/extraSlice";
import { updateProduct } from "../store/slices/productsSlice";
import { 
  LoaderCircle, X, Leaf, Tag, Boxes, 
  DollarSign, ShoppingBasket, Fish, UtensilsCrossed, RefreshCw, ImagePlus 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FloatingVegetables from "../components/Fruit/FloatingVegetables";

const UpdateProductModal = ({ selectedProduct }) => {
  const { loading } = useSelector((state) => state.product);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Fruits",
    stock: "",
  });

  // Mảng chứa các file ảnh mới được chọn (File object)
  const [newImages, setNewImages] = useState([]); 
  // Mảng chứa link preview để hiển thị (bao gồm cả ảnh cũ và ảnh mới)
  const [imagesPreview, setImagesPreview] = useState([]); 

  const categoryOptions = ["Fruits", "Vegetables", "Packages", "Meats", "Seafoods"];

  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        name: selectedProduct.name || "",
        description: selectedProduct.description || "",
        price: selectedProduct.price || "",
        category: selectedProduct.category || "Fruits",
        stock: selectedProduct.stock || "",
      });
      // Hiển thị mảng ảnh cũ từ server
      setImagesPreview(selectedProduct.images?.map(img => img.url) || []);
      setNewImages([]); // Reset mảng ảnh mới
    }
  }, [selectedProduct]);

  // Xử lý khi chọn file mới
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Giới hạn tổng số ảnh (cũ + mới) là 3. Tùy ní logic chỗ này.
    // Ở đây tôi xử lý theo hướng: chọn mới là thay thế hoàn toàn ảnh cũ.
    
    const limitedFiles = files.slice(0, 3); // Chỉ lấy tối đa 3 file đầu tiên
    setNewImages(limitedFiles);

    // Tạo preview cho các file mới
    const previews = [];
    limitedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === limitedFiles.length) {
          setImagesPreview(previews); // Cập nhật mảng preview
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Vegetables": return <Leaf size={18} />;
      case "Seafoods": return <Fish size={18} />;
      case "Meats": return <UtensilsCrossed size={18} />;
      case "Packages": return <ShoppingBasket size={18} />;
      default: return <Tag size={18} />;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Sử dụng FormData để gửi kèm mảng file ảnh
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("category", formData.category);
    data.append("stock", formData.stock);
    
    // Gửi mảng các ảnh mới
    if (newImages.length > 0) {
      newImages.forEach(image => {
        data.append("images", image); // Backend Multer cần .array('images', 3)
      });
    }

    dispatch(updateProduct(selectedProduct._id, data));
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 font-['Fredoka']">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={() => dispatch(toggleUpdateProductModal())}
        className="absolute inset-0 bg-white/40 backdrop-blur-md"
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingVegetables activeColor="#77cd3af2" />
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-white/80 backdrop-blur-2xl w-full max-w-2xl rounded-[45px] shadow-2xl border border-white p-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <button
          onClick={() => dispatch(toggleUpdateProductModal())}
          className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-400 hover:text-red-500 rounded-full transition-all"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-blue-50 rounded-2xl mb-3 text-blue-500">
            <RefreshCw size={28} className={loading ? "animate-spin" : ""} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">
            Refresh <span className="text-[#77cd3af2] font-serif italic font-normal">Inventory</span>
          </h2>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleSubmit}>
          {/* PHẦN CHỌN NHIỀU ẢNH (3 ẢNH) */}
          <div className="md:col-span-2 flex flex-col items-center gap-4 mb-4">
            <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
              {/* Hiển thị 3 ô ảnh */}
              {[...Array(3)].map((_, index) => (
                <div 
                  key={index}
                  onClick={() => fileInputRef.current.click()}
                  className="relative aspect-square rounded-[30px] overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 hover:border-[#77cd3af2] cursor-pointer group transition-all"
                >
                  {imagesPreview[index] ? (
                    <img src={imagesPreview[index]} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                      <ImagePlus size={24} />
                      <span className="text-[9px] font-bold uppercase mt-1">Slot {index + 1}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <RefreshCw className="text-white" size={20} />
                  </div>
                </div>
              ))}
            </div>
            
            <input 
              type="file" ref={fileInputRef} className="hidden" 
              accept="image/*" multiple onChange={handleImagesChange} 
            />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">
              Tap any slot to upload up to 3 fresh photos
            </p>
          </div>

          <div className="relative">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input
              type="text" required placeholder="Product Title"
              className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-100 rounded-[22px] outline-none text-sm"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#77cd3af2]">
              {getCategoryIcon(formData.category)}
            </div>
            <select
              className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-100 rounded-[22px] outline-none text-sm appearance-none cursor-pointer"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categoryOptions.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input
              type="number" required placeholder="Price ($)"
              className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-100 rounded-[22px] outline-none text-sm"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <div className="relative">
            <Boxes className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input
              type="number" required placeholder="Stock"
              className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-100 rounded-[22px] outline-none text-sm"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            />
          </div>

          <textarea
            placeholder="Update product details..."
            className="w-full p-5 bg-white/50 border border-gray-100 rounded-[30px] outline-none text-sm md:col-span-2 resize-none italic"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 w-full py-4 bg-gray-900 text-white rounded-[25px] font-bold shadow-lg hover:bg-black hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {loading ? <LoaderCircle className="animate-spin" size={20} /> : "Save Inventory Changes"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default UpdateProductModal;