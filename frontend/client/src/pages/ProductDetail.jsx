import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Share2,
  ArrowLeft,
  ShoppingBag,
  Minus,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProductGallery from "../components/ProductDetail/ProductGallery";
import ReviewsContainer from "../components/Products/ReviewsContainer";
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
  const [isExpanded, setIsExpanded] = useState(false);

  // Khai báo state quản lý ảnh và số lượng
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Gộp chung Selector
  const {
    productDetails: product,
    loading,
    relatedProducts,
  } = useSelector((state) => state.product);
  const { recipes } = useSelector((state) => state.recommend);

  // Reset số lượng về 1 khi người dùng chuyển sang trang chi tiết sản phẩm khác
  useEffect(() => {
    setQuantity(1);
    setSelectedImageIndex(0);
  }, [id]);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
      dispatch(fetchRelatedProducts(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (product && relatedProducts?.length > 0) {
      dispatch(
        fetchRecipes([
          product.name,
          ...relatedProducts.slice(0, 2).map((p) => p.name),
        ]),
      );
    }
  }, [product, relatedProducts, dispatch]);

  const handleFlyToCart = (e, targetProduct) => {
    e.preventDefault();
    e.stopPropagation();

    const productImage = document.querySelector(".product-gallery-active-img");
    const cartIcon = document.getElementById("navbar-cart-icon");

    dispatch(
      addToCartThunk({ productId: targetProduct._id, quantity }),
    ).unwrap();
    toast.success(`Added ${targetProduct.name} to Bag`);

    if (productImage && cartIcon) {
      const imgRect = productImage.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();

      const flyImg = document.createElement("img");
      flyImg.src = productImage.src;
      flyImg.className = "fly-to-cart-element";

      const size = 60;
      flyImg.style.width = `${size}px`;
      flyImg.style.height = `${size}px`;

      flyImg.style.left = `${imgRect.left + imgRect.width / 2 - size / 2}px`;
      flyImg.style.top = `${imgRect.top + imgRect.height / 2 - size / 2}px`;

      const targetLeft = cartRect.left + cartRect.width / 2 - 12;
      const targetTop = cartRect.top + cartRect.height / 2 - 12;

      flyImg.style.setProperty(
        "--fly-X",
        `${targetLeft - (imgRect.left + imgRect.width / 2 - size / 2)}px`,
      );
      flyImg.style.setProperty(
        "--fly-Y",
        `${targetTop - (imgRect.top + imgRect.height / 2 - size / 2)}px`,
      );

      document.body.appendChild(flyImg);

      setTimeout(() => {
        flyImg.remove();
        cartIcon.classList.add("cart-bounce-feedback");
        setTimeout(
          () => cartIcon.classList.remove("cart-bounce-feedback"),
          300,
        );
      }, 800);
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-400 bg-[#f6f6f9] dark:bg-[#08080a]">
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs uppercase tracking-[0.3em] animate-pulse">
            Loading Masterpiece...
          </span>
        </div>
      </div>
    );
  }

  const renderProductTag = () => {
    const price = Number(product.price || 0);
    const discountPrice = Number(product.discountPrice || 0);

    if (discountPrice > 0 && price > 0 && discountPrice < price) {
      const calculatedDiscount = Math.round(
        ((price - discountPrice) / price) * 100,
      );

      return (
        <div className="absolute top-5 right-5 z-10 px-2.5 py-1 text-[11px] md:text-xs font-extrabold text-white bg-rose-500 rounded-full shadow-sm tracking-wide flex items-center justify-center min-w-[42px]">
          -{calculatedDiscount}%
        </div>
      );
    }
    return null;
  };

  return (
    <main className="min-h-screen pt-28 md:pt-36 pb-24 bg-[#f6f6f9] dark:bg-[#08080a] relative overflow-hidden transition-colors duration-1000 select-none antialiased">
      <ToastContainer
        toastStyle={{
          borderRadius: "32px",
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 10px 50px rgba(0,0,0,0.03)",
        }}
      />

      <FloatingDecor />

      {/* Ambient Mesh Glow Effect */}
      <div className="absolute top-0 inset-x-0 h-[100vh] pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            x: [-100, 100, -100],
            y: [-50, 50, -50],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-radial from-[#77cd3a]/8 via-[#77cd3a]/2 to-transparent dark:from-[#77cd3a]/12 blur-[160px] rounded-full"
        />
        <motion.div
          animate={{
            x: [50, -50, 50],
            y: [100, -100, 100],
            scale: [1.1, 0.9, 1.1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] -right-[20%] w-[60vw] h-[60vw] bg-radial from-[#77cd3a]/5 via-transparent to-transparent dark:from-[#77cd3a]/8 blur-[140px] rounded-full"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12">
        {/* Minimal Breadcrumb */}
        <nav className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-neutral-400 dark:text-neutral-600 mb-12 w-fit">
          <button
            onClick={() => navigate(-1)}
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors flex items-center gap-2 group font-semibold"
          >
            <ArrowLeft
              size={11}
              className="group-hover:-translate-x-1 transition-transform duration-500 ease-out"
            />
            <span>Close</span>
          </button>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-200 font-medium truncate">
            {product.name}
          </span>
        </nav>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24 items-start">
          {/* CỘT TRÁI: PRODUCT GALLERY */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            className="lg:col-span-5 w-full relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent dark:from-white/2 blur-2xl -z-10 rounded-3xl" />
            <ProductGallery
              images={product.images}
              selectedIndex={selectedImageIndex}
              setSelectedIndex={setSelectedImageIndex}
              isOutOfStock={product.stock === 0}
            />
            {renderProductTag()}
          </motion.div>

          {/* CỘT PHẢI: PRODUCT DETAILS */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: 0.1 }}
            className="lg:col-span-7 flex flex-col lg:sticky lg:top-36"
          >
            <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-neutral-900 dark:text-neutral-100 mb-4 leading-[1.12]">
              {product.name}
            </h2>

            {/* Ratings Summary */}
            <div className="flex items-center gap-3 mb-8 text-xs font-light text-neutral-400 dark:text-neutral-500">
              <div className="flex gap-0.5 items-center">
                {[...Array(5)].map((_, i) => {
                  const ratingValue = product.ratings || 0;
                  return (
                    <Star
                      key={i}
                      size={11}
                      fill={i < Math.floor(ratingValue) ? "#77cd3a" : "none"}
                      className={
                        i < Math.floor(ratingValue)
                          ? "text-[#77cd3a]"
                          : "text-neutral-300 dark:text-neutral-800"
                      }
                      strokeWidth={i < Math.floor(ratingValue) ? 0 : 1.5}
                    />
                  );
                })}
                <span className="ml-2 font-medium text-neutral-800 dark:text-neutral-200 text-[13px]">
                  {product.ratings?.toFixed(1)}
                </span>
              </div>
              <span className="opacity-30">•</span>
              <span className="tracking-wide text-[11px] font-normal">
                {product.numOfReviews} Bespoke Reviews
              </span>
            </div>

            <p className="text-sm md:text-[14px] text-neutral-500 leading-relaxed text-justify">
              {isExpanded || product.description?.length <= 500
                ? product.description
                : `${product.description?.slice(0, 500)}...`}
            </p>

            {product.description?.length > 200 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 mb-8 text-sm text-neutral-500 hover:text-neutral-700"
              >
                {isExpanded ? "Read less" : "Read more"}
              </button>
            )}

            {/* Purchase Bar */}

            <div className="flex flex-col gap-6 pt-6 border-t border-neutral-200/50 dark:border-neutral-800/60">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 font-medium">
                  Price
                </span>

                <div className="flex items-baseline gap-2">
                  {product?.discountPrice > 0 ? (
                    <>
                      <div className="flex items-baseline text-[#77cd3a]">
                        <span className="text-lg font-light mr-0.5">$</span>
                        <span className="text-2xl font-normal tracking-tight">
                          {product.discountPrice.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-baseline text-neutral-400 dark:text-neutral-500 line-through font-normal text-sm">
                        <span>$</span>
                        <span>
                          {product.price ? product.price.toFixed(2) : "0.00"}
                        </span>
                      </div>
                    </>
                  ) : (
                    /* Nếu không giảm giá, hiển thị giá thường mặc định */
                    <div className="flex items-baseline text-neutral-900 dark:text-neutral-50">
                      <span className="text-lg font-light text-neutral-400 mr-0.5">
                        $
                      </span>
                      <span className="text-4xl font-extralight tracking-tight">
                        {product?.price ? product.price.toFixed(2) : "0.00"}
                      </span>
                    </div>
                  )}

                  <span className="text-[10px] sm:text-xs text-neutral-400 font-medium lowercase tracking-tight ml-1">
                    / per unit
                  </span>
                </div>
              </div>

              {/* PHẦN ĐIỀU CHỈNH SỐ LƯỢNG & NÚT ADD TO BAG */}
              <div className="flex items-center gap-3 w-full mt-2">
                <div className="flex items-center bg-neutral-100/80 dark:bg-neutral-900/60 p-1 rounded-xl border border-neutral-200/20 dark:border-neutral-800/30 h-12 backdrop-blur-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-white dark:hover:bg-neutral-800/50 shadow-none hover:shadow-sm active:scale-95 transition-all duration-200"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-medium px-2 text-neutral-800 dark:text-neutral-200 min-w-[32px] text-center tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-white dark:hover:bg-neutral-800/50 shadow-none hover:shadow-sm active:scale-95 transition-all duration-200"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: product.stock === 0 ? 1 : 1.01, y: -1 }}
                  whileTap={{ scale: product.stock === 0 ? 1 : 0.99 }}
                  onClick={(e) => handleFlyToCart(e, product)}
                  disabled={product.stock === 0}
                  className="flex-1 h-12 bg-transparent text-[#77cd3a] text-sm font-semibold rounded-xl flex items-center justify-center gap-2 border border-[#77cd3a]/40 hover:border-[#77cd3a] active:scale-[0.98] transition-all duration-300 disabled:opacity-30"
                >
                  <ShoppingBag size={13} />
                  <span>
                    {product.stock === 0 ? "Out of Stock" : "Add to Bag"}
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: product.stock === 0 ? 1 : 1.01, y: -1 }}
                  whileTap={{ scale: product.stock === 0 ? 1 : 0.99 }}
                  onClick={(e) => {
                    navigate("/checkout", {
                      state: { buyNowItem: { product: product, quantity: quantity } },
                    });
                  }}
                  disabled={product.stock === 0}
                  className="flex-1 h-12 bg-transparent text-[#77cd3a] text-sm font-semibold rounded-xl flex items-center justify-center gap-2 border border-[#77cd3a]/40 hover:border-[#77cd3a] active:scale-[0.98] transition-all duration-300 disabled:opacity-30"
                >
                  <ShoppingBag size={13} />
                  <span>
                    {product.stock === 0 ? "Out of Stock" : "Buy Now"}
                  </span>
                </motion.button>
              </div>
            </div>

            {/* Meta Footer */}
            <div className="mt-8 flex justify-between items-center text-[9px] tracking-[0.15em] uppercase text-neutral-400 dark:text-neutral-600 font-medium px-1">
              <button className="flex items-center gap-1.5 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors group">
                <Share2
                  size={10}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
                <span>Share</span>
              </button>
              <div className="flex items-center gap-3 normal-case">
                <span>ID: {product._id?.slice(-6)}</span>
                <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-800" />
                <span
                  className={
                    product.stock > 10
                      ? "text-neutral-400"
                      : "text-amber-600 font-normal"
                  }
                >
                  {product.stock} pcs
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 🛠️ CHỖ NÀY ĐÃ ĐƯỢC CHỈNH SỬA KHOẢNG CÁCH (LOWER SECTIONS) */}
        <div className="mt-20 md:mt-24 flex flex-col gap-14 md:gap-16 relative z-10">
          <div className="opacity-95 hover:opacity-100 transition-opacity duration-500">
            <BundleSection mainProduct={product} />
          </div>

          {recipes && recipes.length > 0 && (
            <div className="pt-8 border-t border-neutral-200/40 dark:border-neutral-900/40">
              <RecipeList recipes={recipes} navigate={navigate} />
            </div>
          )}

          <div className="pt-8 border-t border-neutral-200/40 dark:border-neutral-900/40">
            <RelatedProducts products={relatedProducts} />
          </div>

          <div className="pt-8 border-t border-neutral-200/40 dark:border-neutral-900/40">
            <ReviewsContainer id="reviews" />
          </div>
        </div>
      </div>

      <style>{`
        .fly-to-cart-element { 
          position: fixed; z-index: 99999; pointer-events: none; border-radius: 12px; 
          animation: absoluteStraightFly 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards; 
          mix-blend-mode: multiply;
        }
        @keyframes absoluteStraightFly { 
          0% { transform: translate(0, 0) scale(1); opacity: 1; } 
          100% { transform: translate(var(--fly-X), var(--fly-Y)) scale(0.1); opacity: 0; } 
        }
        .cart-bounce-feedback { animation: miniPop 0.3s ease-out both; }
        @keyframes miniPop { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
      `}</style>
    </main>
  );
};

export default ProductDetail;
