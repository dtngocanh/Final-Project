import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Share2,
  ChevronLeft,
  Minus,
  Plus,
  ShoppingBag,
  ArrowLeft,
  ChevronRight,
  Utensils,
} from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductGallery from "../components/ProductDetail/ProductGallery";
import ReviewsContainer from "../components/Products/ReviewsContainer";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import FloatingDecor from "../components/Fruit/FloatingDecor";
import { useCartActions } from "../hooks/useCartActions";
import { fetchProductDetails, fetchRelatedProducts } from "../store/slices/productSlice";
import BundleSection from "../components/ProductDetail/BundleSelection";
import RelatedProducts from "../components/ProductDetail/RelatedProducts";

// import RecommendedProductCard from "../components/Products/RecommendedProductCard";
// import RecipeSection from "../components/Products/RecipeSection";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { handleCartAction } = useCartActions();
  // Destructuring + rename
  const {
    productDetails: product,
    loading,
    relatedProducts,
    recipes,
  } = useSelector((state) => state.product);
  // console.log(relatedProducts);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
      dispatch(fetchRelatedProducts(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product]);

  if (loading) return <p>Loading...</p>;

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center uppercase tracking-widest text-[10px] opacity-30">
        Product Not Found
      </div>
    );

  return (
    <main className="min-h-screen pt-24 pb-16 bg-white dark:bg-[#060606] relative overflow-hidden transition-colors duration-700">
      <ToastContainer toastStyle={{ borderRadius: "20px" }} />

      {/* 2. Gọi FloatingDecor thay cho đống code cũ */}
      <FloatingDecor />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Breadcrumb / Back Button */}
        <nav className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-gray-400 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="hover:text-[#77cd3a] transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <ChevronLeft className="rotate-180 opacity-20" size={12} />
          <span className="dark:text-white/20 truncate max-w-[150px]">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-6">
            <ProductGallery
              images={product.images}
              selectedIndex={selectedImageIndex}
              setSelectedIndex={setSelectedImageIndex}
              isOutOfStock={product.stock === 0}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-6 flex flex-col justify-start"
          >
            <div className="flex items-center gap-2 text-[#77cd3a] mb-2">
              <img
                src="/hahahaha.png"
                alt=""
                className="w-4 h-4 object-contain"
              />
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">
                {product.category}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extralight tracking-tighter text-gray-900 dark:text-white mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => {
                    const ratingValue = product.ratings || 0;
                    const fullStars = Math.floor(ratingValue); // số sao đầy
                    const hasHalfStar = ratingValue - fullStars >= 0.5; // có nửa sao không

                    if (i < fullStars) {
                      // Sao đầy
                      return (
                        <Star
                          key={i}
                          size={14}
                          fill="#77cd3a"
                          className="text-[#77cd3a]"
                          strokeWidth={0}
                        />
                      );
                    } else if (i === fullStars && hasHalfStar) {
                      // Sao nửa chừng
                      return (
                        <Star
                          key={i}
                          size={14}
                          fill="url(#half)" // cần định nghĩa gradient half
                          className="text-[#77cd3a]"
                          strokeWidth={0}
                        />
                      );
                    } else {
                      // Sao rỗng
                      return (
                        <Star
                          key={i}
                          size={14}
                          fill="none"
                          className="text-gray-300 border-[#77cd3a]" // viền xanh cho 0 sao
                          strokeWidth={1}
                        />
                      );
                    }
                  })}
                </div>

                {/* Hiển thị số trung bình */}
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {product.ratings?.toFixed(1)} / 5
                </span>
              </div>

              <span className="text-[11px] text-gray-600 tracking-widest">
                Total: {product.numOfReviews} Reviews
              </span>
            </div>

            <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed italic mb-8 border-l border-[#77cd3a]/30 pl-4">
              "{product.description}"
            </p>

            <div className="p-8 bg-gray-50/50 dark:bg-white/[0.02] backdrop-blur-md rounded-[32px] border border-gray-100 dark:border-white/[0.05] shadow-sm">
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
                    className="hover:text-[#77cd3a] transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-xs w-4 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="hover:text-[#77cd3a] transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCartAction(product, "ADD", quantity)}
                disabled={product.stock === 0}
                className="w-full py-4 bg-[#77cd3a] text-white dark:text-black font-bold rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-[#77cd3a]/10 disabled:opacity-20 transition-all"
              >
                <ShoppingBag size={15} />
                <span className="uppercase tracking-[0.2em] text-[10px]">
                  {product.stock === 0 ? "Out of Stock" : "Add to Bag"}
                </span>
              </motion.button>
            </div>

            <div className="mt-6 flex justify-between items-center opacity-40 px-2">
              <button className="text-[8px] uppercase tracking-widest flex items-center gap-2 hover:text-[#77cd3a] transition-colors">
                <Share2 size={10} /> Share
              </button>
              <span className="text-[8px] uppercase tracking-widest italic">
                Ref: 00{product._id?.slice(-4)} • {product.stock} left
              </span>
            </div>
          </motion.div>
        </div>

        {/* {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-24 relative group">
            <div className="flex flex-col mb-8">
              <span className="text-[8px] text-[#77cd3a] font-black uppercase tracking-[0.5em] mb-2">
                Curated for you
              </span>
              <h3 className="text-3xl font-extralight tracking-tighter dark:text-white">
                Similar Selections
              </h3>
            </div>

            <div className="hidden lg:flex gap-2 absolute top-0 right-0 z-20">
              <button className="swiper-prev-btn p-2 rounded-full border border-gray-100 dark:border-white/10 hover:bg-[#77cd3a] hover:text-white transition-all">
                <ChevronLeft size={16} />
              </button>
              <button className="swiper-next-btn p-2 rounded-full border border-gray-100 dark:border-white/10 hover:bg-[#77cd3a] hover:text-white transition-all">
                <ChevronRight size={16} />
              </button>
            </div>

            <Swiper
              modules={[Navigation]}
              spaceBetween={24}
              slidesPerView={1.5} // Mobile hiện 1.5 sản phẩm để biết còn nữa
              navigation={{
                nextEl: ".swiper-next-btn",
                prevEl: ".swiper-prev-btn",
              }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 4 }, // Desktop hiện 4
              }}
              className="mySwiper"
            >
              {relatedProducts.map((item) => (
                <SwiperSlide key={item._id}>
                  <RecommendedProductCard item={item} navigate={navigate} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {recipes && recipes.length > 0 && (
          <RecipeSection
            product={product}
            recipeProducts={recipes}
            navigate={navigate}
          />
        )} */}
        <br />
        <BundleSection mainProduct={product} />
        <RelatedProducts products={relatedProducts} />

        <div className="mt-24 relative z-10">
          <ReviewsContainer id="reviews" />
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
