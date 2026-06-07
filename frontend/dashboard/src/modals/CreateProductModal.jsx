import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createNewProduct } from "../store/slices/productsSlice";
import { toggleCreateProductModal } from "../store/slices/extraSlice";
import {
  LoaderCircle,
  X,
  ImagePlus,
  Leaf,
  Tag,
  Boxes,
  DollarSign,
  ShoppingBasket,
  Fish,
  UtensilsCrossed,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FloatingVegetables from "../components/Fruit/FloatingVegetables";

const CreateProductModal = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.product);
  const { categories, selectedCategory } = useSelector(
    (state) => state.category,
  );

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setImages((prevImages) => {
      const combinedFiles = [...prevImages, ...newFiles].slice(0, 3);

      const newPreviews = combinedFiles.map((file) =>
        URL.createObjectURL(file),
      );
      setPreviews(newPreviews);

      return combinedFiles;
    });
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Vegetables":
        return <Leaf size={18} />;
      case "Seafoods":
        return <Fish size={18} />;
      case "Meats":
        return <UtensilsCrossed size={18} />;
      case "Packages":
        return <ShoppingBasket size={18} />;
      default:
        return <Tag size={18} />;
    }
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("productData", JSON.stringify(formData));
    images.forEach((file) => {
      if (file) {
        data.append("images", file);
      }
    });
    try {
      await dispatch(createNewProduct(data)).unwrap();

      dispatch(toggleCreateProductModal());
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 font-['Fredoka']">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => dispatch(toggleCreateProductModal())}
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
          onClick={() => dispatch(toggleCreateProductModal())}
          className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-400 hover:text-red-500 rounded-full transition-all"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-green-50 rounded-2xl mb-3">
            <ShoppingBasket className="text-[#77cd3af2]" size={28} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">
            Harvest New{" "}
            <span className="text-[#77cd3af2] font-serif italic font-normal">
              Product
            </span>
          </h2>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
            Add fresh items to Veganic Mart
          </p>
        </div>

        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
          onSubmit={handleSubmit}
        >
          {/* PHẦN CHỌN 3 ẢNH PREVIEW */}
          <div className="md:col-span-2 flex flex-col items-center gap-4 mb-4">
            <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  onClick={() => fileInputRef.current.click()}
                  className="relative aspect-square rounded-[30px] overflow-hidden bg-white/50 border-2 border-dashed border-gray-100 hover:border-[#77cd3af2] cursor-pointer group transition-all"
                >
                  {previews[i] ? (
                    <img
                      src={previews[i]}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                      <ImagePlus size={24} />
                      <span className="text-[9px] font-bold mt-1">
                        Slot {i + 1}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[#77cd3a10] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <RefreshCw
                      className="text-[#77cd3af2] animate-spin-slow"
                      size={20}
                    />
                  </div>
                </div>
              ))}
            </div>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">
              Tap to select up to 3 fresh photos
            </p>
          </div>

          <div className="relative">
            <Tag
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
              size={18}
            />
            <input
              type="text"
              required
              placeholder="Product Title"
              className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-100 rounded-[22px] outline-none text-sm"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="relative text-gray-500">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#77cd3af2]">
              {getCategoryIcon(formData.category)}
            </div>
            {/* <select
              className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-100 rounded-[22px] outline-none text-sm appearance-none cursor-pointer"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select> */}
            <select
              className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-100 rounded-[22px] outline-none text-sm appearance-none cursor-pointer"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <React.Fragment key={cat._id}>
                  {/* 1. Hiển thị Danh mục Cha (Level 0)*/}
                  <option value={cat._id} className="font-bold text-gray-900">
                    {cat.name}
                  </option>

                  {/* 2. Kiểm tra nếu có danh mục con */}
                  {cat.subcategories &&
                    cat.subcategories.map((sub) => (
                      <option
                        key={sub._id}
                        value={sub._id}
                        className="text-gray-600"
                      >
                        &nbsp;&nbsp;&nbsp;&nbsp;{sub.name}
                      </option>
                    ))}
                </React.Fragment>
              ))}
            </select>
          </div>

          <div className="relative">
            <DollarSign
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
              size={18}
            />
            <input
              type="number"
              required
              placeholder="Price ($)"
              className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-100 rounded-[22px] outline-none text-sm"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
          </div>

          <div className="relative">
            <Boxes
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
              size={18}
            />
            <input
              type="number"
              required
              placeholder="Stock Count"
              className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-100 rounded-[22px] outline-none text-sm"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
            />
          </div>

          <textarea
            placeholder="Write a short description..."
            className="w-full p-5 bg-white/50 border border-gray-100 rounded-[30px] outline-none text-sm md:col-span-2 resize-none italic"
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 w-full py-4 bg-[#77cd3af2] text-white rounded-[25px] font-bold shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {loading ? (
              <LoaderCircle className="animate-spin" size={20} />
            ) : (
              "Harvest Product"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateProductModal;
