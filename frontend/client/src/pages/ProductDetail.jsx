import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Share2,
  ChevronLeft,
  Minus,
  Plus,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProductGallery from "../components/ProductDetail/ProductGallery";
import ReviewsContainer from "../components/Products/ReviewsContainer";

import "swiper/css";
import "swiper/css/navigation";

import FloatingDecor from "../components/Fruit/FloatingDecor";
import {
  fetchProductDetails,
  fetchRelatedProducts,
} from "../store/slices/productSlice";
import BundleSection from "../components/ProductDetail/BundleSelection";
import RelatedProducts from "../components/ProductDetail/RelatedProducts";
import { fetchRecipes } from "../store/slices/recommendSlice";
import RecipeList from "../components/Recipe/RecipeList";
import { addToCartThunk } from "../store/slices/cartSlice";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const {
    productDetails: product,
    loading,
    relatedProducts,
  } = useSelector((state) => state.product);

  const { recipes } = useSelector((state) => state.recommend);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
      dispatch(fetchRelatedProducts(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (product && relatedProducts?.length > 0) {
      const ingredients = [
        product.name,
        ...relatedProducts.slice(0, 2).map((p) => p.name),
      ];
      dispatch(fetchRecipes(ingredients));
    }
  }, [product, relatedProducts, dispatch]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product]);

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center uppercase tracking-[0.6em] text-[9px] font-medium text-neutral-400">
        Loading Masterpiece...
      </div>
    );

  return (
    <main className="min-h-screen pt-28 md:pt-36 pb-24 bg-[#f6f6f9] dark:bg-[#08080a] relative overflow-hidden transition-colors duration-1000 select-none antialiased">
      <ToastContainer toastStyle={{ borderRadius: "32px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", boxShadow: "0 10px 50px rgba(0,0,0,0.03)" }} />

      <FloatingDecor />

      {/* ================= ULTRA-SMOOTH AMBIENT MESH GLOW ================= */}
      {/* Luồng sáng cực mịn, không tạo viền đốm, chuyển động siêu chậm như khói sinh học */}
      <div className="absolute top-0 inset-x-0 h-[100vh] pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ 
            x: [-100, 100, -100],
            y: [-50, 50, -50],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-radial from-[#77cd3a]/8 via-[#77cd3a]/2 to-transparent dark:from-[#77cd3a]/12 blur-[160px] rounded-full"
        />
        <motion.div 
          animate={{ 
            x: [50, -50, 50],
            y: [100, -100, 100],
            scale: [1.1, 0.9, 1.1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] -right-[20%] w-[60vw] h-[60vw] bg-radial from-[#77cd3a]/5 via-transparent to-transparent dark:from-[#77cd3a]/8 blur-[140px] rounded-full"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12">
        
        {/* Navigation / Minimal Breadcrumb */}
        <nav className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-neutral-400 dark:text-neutral-600 mb-12 w-fit">
          <button
            onClick={() => navigate(-1)}
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors flex items-center gap-2 group font-semibold"
          >
            <ArrowLeft size={11} className="group-hover:-translate-x-1 transition-transform duration-500 ease-out" /> 
            <span>Close</span>
          </button>
          <span className="opacity-30">/</span>
          <span className="text-neutral-400 dark:text-neutral-500 font-light lowercase italic tracking-normal truncate max-w-[200px]">
            {product.category}
          </span>
        </nav>

        {/* Layout Tỉ lệ vàng: 7 cột (Ảnh) và 5 cột (Thông tin) để tạo khoảng trống thở cực rộng */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24 items-start">
          
          {/* ================= CỘT TRÁI: GALLERY PHÓNG KHOÁNG ================= */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            className="lg:col-span-7 w-full relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent dark:from-white/2 blur-2xl -z-10 rounded-3xl" />
            <ProductGallery
              images={product.images}
              selectedIndex={selectedImageIndex}
              setSelectedIndex={setSelectedImageIndex}
              isOutOfStock={product.stock === 0}
            />
          </motion.div>

          {/* ================= CỘT PHẢI: EDITORIAL DETAILS ================= */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: 0.1 }}
            className="lg:col-span-5 flex flex-col lg:sticky lg:top-36"
          >
            {/* Tiêu đề thanh lịch, mượt mà */}
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-neutral-900 dark:text-neutral-100 mb-4 leading-[1.12]">
              {product.name}
            </h1>

            {/* Cụm Đánh giá Tối giản - Không viền, không rườm rà */}
            <div className="flex items-center gap-3 mb-8 text-xs font-light text-neutral-400 dark:text-neutral-500">
              <div className="flex gap-0.5 items-center">
                {[...Array(5)].map((_, i) => {
                  const ratingValue = product.ratings || 0;
                  return (
                    <Star 
                      key={i} 
                      size={11} 
                      fill={i < Math.floor(ratingValue) ? "#77cd3a" : "none"} 
                      className={i < Math.floor(ratingValue) ? "text-[#77cd3a]" : "text-neutral-300 dark:text-neutral-800"} 
                      strokeWidth={i < Math.floor(ratingValue) ? 0 : 1.5} 
                    />
                  );
                })}
                <span className="ml-2 font-medium text-neutral-800 dark:text-neutral-200 text-[13px]">
                  {product.ratings?.toFixed(1)}
                </span>
              </div>
              <span className="opacity-30">•</span>
              <span className="tracking-wide text-[11px] font-normal">{product.numOfReviews} Bespoke Reviews</span>
            </div>

            {/* Mô tả sản phẩm dạng Editorial Line spacing rộng thoáng */}
            <p className="text-[14px] text-neutral-500 dark:text-neutral-400 leading-[1.7] font-light tracking-wide text-justify mb-10">
              {product.description}
            </p>

            {/* ================= THE NEW INTEGRATED PURCHASE BAR ================= */}
            {/* Thiết kế phẳng hoàn toàn, dùng phân tách khoảng trống (Whitespace) thay vì đóng khung */}
            <div className="flex flex-col gap-6 pt-6 border-t border-neutral-200/50 dark:border-neutral-800/60">
              
              {/* Hiển thị Giá tiền lớn, sắc nét */}
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 font-medium">Value</span>
                <div className="flex items-baseline text-neutral-900 dark:text-neutral-50">
                  <span className="text-lg font-light text-neutral-400 mr-0.5">$</span>
                  <span className="text-4xl font-extralight tracking-tight">
                    {(product.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Hợp nhất Control Số lượng + Nút mua hàng trên 1 hàng ngang cực mượt */}
              <div className="flex items-center gap-3 w-full mt-2">
                
                {/* Bộ đếm số lượng dẹp, không viền hộp cứng */}
                <div className="flex items-center bg-neutral-200/50 dark:bg-neutral-900/60 p-1 rounded-2xl border border-neutral-300/10 h-14">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 active:scale-95 transition-all"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-semibold px-2 text-neutral-800 dark:text-neutral-200 min-w-[28px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 active:scale-95 transition-all"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Nút Add to Bag tràn viền bo mềm, đổ bóng tinh xảo ôm sát chân nút */}
                <motion.button
                  whileHover={{ scale: product.stock === 0 ? 1 : 1.01, y: -1 }}
                  whileTap={{ scale: product.stock === 0 ? 1 : 0.99 }}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                      await dispatch(
                        addToCartThunk({ productId: product._id, quantity: quantity }),
                      ).unwrap();
                      toast.success(`Added ${product.name} to cart`);
                    } catch (error) {
                      toast.error("Failed to add product to cart");
                    }
                  }}
                  disabled={product.stock === 0}
                  className="flex-1 h-14 bg-[#77cd3a] text-white dark:text-neutral-950 font-bold text-[11px] uppercase tracking-[0.25em] rounded-2xl flex items-center justify-center gap-3 shadow-[0_10px_25px_rgba(119,205,58,0.25)] hover:shadow-[0_15px_30px_rgba(119,205,58,0.4)] disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-500 ease-out"
                >
                  <ShoppingBag size={13} />
                  <span>{product.stock === 0 ? "Out of Stock" : "Add to Bag"}</span>
                </motion.button>
              </div>
            </div>

            {/* Meta Footer của cụm thông tin */}
            <div className="mt-8 flex justify-between items-center text-[9px] tracking-[0.15em] uppercase text-neutral-400 dark:text-neutral-600 font-medium px-1">
              <button className="flex items-center gap-1.5 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors group">
                <Share2 size={10} className="group-hover:scale-110 transition-transform duration-300" /> 
                <span>Share</span>
              </button>
              <div className="flex items-center gap-3 font-light normal-case">
                <span>ID: {product._id?.slice(-6)}</span>
                <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-800" />
                <span className={product.stock > 10 ? "text-neutral-400" : "text-amber-600 font-normal"}>
                  {product.stock} pieces available
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ================= THE RELATIVE LOWER SECTIONS ================= */}
        {/* Đẩy khoảng cách siêu xa (mt-40) để tạo nhịp điệu cuộn chuột đẳng cấp, thư thái */}
        <div className="mt-40 md:mt-48 flex flex-col gap-28 md:gap-36 relative z-10">
          <div className="opacity-95 hover:opacity-100 transition-opacity duration-500">
            <BundleSection mainProduct={product} />
          </div>
          
          {recipes && recipes.length > 0 && (
            <div className="pt-12 border-t border-neutral-200/40 dark:border-neutral-900/40">
              <RecipeList recipes={recipes} navigate={navigate} />
            </div>
          )}
          
          <div className="pt-12 border-t border-neutral-200/40 dark:border-neutral-900/40">
            <RelatedProducts products={relatedProducts} />
          </div>

          <div className="pt-12 border-t border-neutral-200/40 dark:border-neutral-900/40">
            <ReviewsContainer id="reviews" />
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;