import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import {
  Star,
  Share2,
  Leaf,
  ChevronLeft,
  Minus,
  Plus,
  ShoppingCart,
  ArrowLeft, // Thêm icon này cho chất
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { addToCart } from "../store/slices/cartSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductGallery from "../components/ProductDetail/ProductGallery";
import ReviewsContainer from "../components/Products/ReviewsContainer";

const ALL_MOCK_PRODUCTS = [
  {
    _id: "1",
    name: "Organic Honey Dragon Fruit",
    price: 14.99,
    category: "Premium Fruits",
    images: ["/mango.png", "/mango.png", "/cheri1.png"],
    stock: 12,
    description:
      "Experience the exotic sweetness of our naturally grown dragon fruit. Hand-picked at peak ripeness.",
  },
  {
    _id: "2",
    name: "Wild Mountain Blueberry",
    price: 8.5,
    category: "Berries",
    images: ["/cheri1.png"],
    stock: 0,
    description:
      "Tiny bursts of antioxidant-rich flavor, harvested from high-altitude wild bushes.",
  },
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Khởi tạo điều hướng
  const dispatch = useDispatch();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const product = useMemo(
    () => ALL_MOCK_PRODUCTS.find((p) => p._id === id),
    [id],
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(
        addToCart({
          product: {
            id: product._id,
            name: product.name,
            price: product.price,
            image: product.images[0],
          },
          quantity,
        }),
      );
      toast.success(
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#77cd3a]">
            Success!
          </p>
          <p className="text-[11px] opacity-70 italic">{product.name} added.</p>
        </div>,
        { position: "top-center", theme: "light" }, // Để light cho sang nhé má
      );
    }
  };

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center uppercase tracking-widest text-[10px] opacity-30">
        Product Not Found
      </div>
    );

  return (
    <main className="min-h-screen pt-24 pb-16 bg-white dark:bg-[#060606] relative">
      <ToastContainer toastStyle={{ borderRadius: "20px" }} />

      {/* --- NÚT BACK FLOATING (Lơ lửng cho dân chơi) --- */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="fixed top-28 left-8 z-50 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full hover:text-[#77cd3a] transition-all group hidden lg:flex shadow-sm"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
      </motion.button>

      <div className="max-w-5xl mx-auto px-6">
        {/* Breadcrumb sát lại - Cập nhật Link thành button quay lại */}
        <nav className="flex items-center gap-2 text-[8px] uppercase tracking-[0.3em] text-gray-400 mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="hover:text-[#77cd3a] transition-colors"
          >
            Back to Shop
          </button>
          <ChevronLeft size={8} className="rotate-180 opacity-20" />
          <span className="dark:text-white/20 truncate max-w-[150px]">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Gallery chiếm 6 cột */}
          <div className="lg:col-span-6">
            <ProductGallery
              images={product.images}
              selectedIndex={selectedImageIndex}
              setSelectedIndex={setSelectedImageIndex}
              isOutOfStock={product.stock === 0}
            />
          </div>

          {/* Info chiếm 6 cột còn lại */}
          <div className="lg:col-span-6 flex flex-col justify-start">
            <div className="flex items-center gap-2 text-[#77cd3a] mb-2">
              <Leaf size={10} strokeWidth={3} />
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">
                {product.category}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extralight tracking-tighter text-gray-900 dark:text-gray-100 mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Rating gọn lại */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={10}
                    fill={i < 4 ? "#77cd3a" : "none"}
                    className={i < 4 ? "text-[#77cd3a]" : "text-gray-200"}
                    strokeWidth={0}
                  />
                ))}
              </div>
              <span className="text-[8px] text-gray-400 uppercase tracking-widest">
                12 Reviews
              </span>
            </div>

            <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed italic mb-8 border-l border-[#77cd3a]/30 pl-4">
              "{product.description}"
            </p>

            {/* Action Box thiết kế liền mạch */}
            <div className="p-6 bg-gray-50 dark:bg-white/[0.02] rounded-[28px] border border-gray-100 dark:border-white/[0.05]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[7px] uppercase tracking-widest text-gray-400 mb-1">
                    Total Investment
                  </p>
                  <p className="text-3xl font-light tracking-tighter dark:text-white">
                    ${(product.price * quantity).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-black/40 px-3 py-2 rounded-full border border-gray-100 dark:border-white/10">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="hover:text-[#77cd3a]"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-mono w-4 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="hover:text-[#77cd3a]"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full py-4 bg-black dark:bg-[#77cd3a] text-white dark:text-black font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#77cd3a]/10 disabled:opacity-20 transition-all"
              >
                <ShoppingCart size={15} />
                <span className="uppercase tracking-[0.2em] text-[10px]">
                  Add to Bag
                </span>
              </motion.button>
            </div>

            <div className="mt-6 flex justify-between items-center opacity-40 px-2">
              <button className="text-[8px] uppercase tracking-widest flex items-center gap-2 hover:text-[#77cd3a] transition-colors">
                <Share2 size={10} /> Share
              </button>
              <span className="text-[8px] uppercase tracking-widest italic">
                Ref: 00{product._id} • {product.stock} left
              </span>
            </div>
          </div>
        </div>
        <ReviewsContainer />
      </div>
    </main>
  );
};

export default ProductDetail;