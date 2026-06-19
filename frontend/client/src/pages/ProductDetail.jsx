import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Share2, ArrowLeft, ShoppingBag, Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProductGallery from "../components/ProductDetail/ProductGallery";
import ReviewsContainer from "../components/Products/ReviewsContainer";
import FloatingDecor from "../components/Fruit/FloatingDecor";
import { fetchProductDetails, fetchRelatedProducts } from "../store/slices/productSlice";
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

  const { productDetails: product, relatedProducts } = useSelector((state) => state.product);
  const { recipes } = useSelector((state) => state.recommend);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
      dispatch(fetchRelatedProducts(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (product && relatedProducts?.length > 0) {
      dispatch(fetchRecipes([product.name, ...relatedProducts.slice(0, 2).map((p) => p.name)]));
    }
  }, [product, relatedProducts, dispatch]);

  const handleFlyToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const productImage = document.querySelector(".product-gallery-active-img");
    const cartIcon = document.getElementById("navbar-cart-icon");

    dispatch(addToCartThunk({ productId: product._id, quantity })).unwrap();
    toast.success("Added to Bag");

    if (productImage && cartIcon) {
      const imgRect = productImage.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();

      // Tạo ảnh phụ để bay với kích thước cố định (60px) để luôn sắc nét
      const flyImg = document.createElement("img");
      flyImg.src = productImage.src;
      flyImg.className = "fly-to-cart-element";
      
      const size = 60; 
      flyImg.style.width = `${size}px`;
      flyImg.style.height = `${size}px`;
      
      // Căn giữa vị trí xuất phát
      flyImg.style.left = `${imgRect.left + imgRect.width / 2 - size / 2}px`;
      flyImg.style.top = `${imgRect.top + imgRect.height / 2 - size / 2}px`;

      const targetLeft = cartRect.left + cartRect.width / 2 - 12;
      const targetTop = cartRect.top + cartRect.height / 2 - 12;

      // Tính toán vector bay
      flyImg.style.setProperty("--fly-X", `${targetLeft - (imgRect.left + imgRect.width / 2 - size / 2)}px`);
      flyImg.style.setProperty("--fly-Y", `${targetTop - (imgRect.top + imgRect.height / 2 - size / 2)}px`);

      document.body.appendChild(flyImg);

      setTimeout(() => {
        flyImg.remove();
        cartIcon.classList.add("cart-bounce-feedback");
        setTimeout(() => cartIcon.classList.remove("cart-bounce-feedback"), 300);
      }, 800);
    }
  };

  if (!product) return <div className="min-h-screen flex items-center justify-center text-neutral-400">Loading Masterpiece...</div>;

  return (
    <main className="min-h-screen pt-12 md:pt-24 pb-5 md:pb-16 bg-[#f6f6f9] dark:bg-[#08080a] relative overflow-x-hidden">
      <ToastContainer toastStyle={{ borderRadius: "32px" }} />
      <FloatingDecor />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 lg:px-12">
        <nav className="flex items-center gap-2 mb-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-neutral-400 hover:text-[#77cd3a] transition-colors whitespace-nowrap">
            <ArrowLeft size={12} /> Back
          </button>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-200 font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-24">
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} selectedIndex={selectedImageIndex} setSelectedIndex={setSelectedImageIndex} />
          </div>

          <div className="lg:col-span-5 flex flex-col lg:sticky lg:top-36 h-fit">
            <h1 className="text-3xl md:text-5xl font-light text-neutral-900 dark:text-white mb-4 leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-3 mb-8 text-xs text-neutral-400">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < Math.floor(product.ratings || 0) ? "#77cd3a" : "none"} className={i < Math.floor(product.ratings || 0) ? "text-[#77cd3a]" : "text-neutral-300"} />)}
              </div>
              <span className="font-bold text-neutral-600 dark:text-neutral-300">{product.numOfReviews || 0} Reviews</span>
            </div>

            <p className="text-sm md:text-[14px] text-neutral-500 leading-relaxed mb-8">{product.description}</p>

            <div className="border-t border-neutral-200/50 pt-6">
              <div className="flex items-end justify-between mb-6">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">Total Price</span>
                <span className="text-3xl font-light text-neutral-900 dark:text-white">${(product.price * quantity).toFixed(2)}</span>
              </div>

              <div className="flex gap-3">
                <div className="flex items-center bg-neutral-200/50 dark:bg-neutral-900/60 rounded-2xl p-1 h-14">
                  <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-12 h-12 flex items-center justify-center hover:text-[#77cd3a]"><Minus size={14}/></button>
                  <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-12 flex items-center justify-center hover:text-[#77cd3a]"><Plus size={14}/></button>
                </div>
                
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => handleFlyToCart(e, product)}
                  disabled={product.stock === 0}
                  className="flex-1 h-14 bg-[#77cd3a] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#66b330] transition-colors disabled:opacity-50"
                >
                  <ShoppingBag size={16} /> {product.stock === 0 ? "Out of Stock" : "Add to Bag"}
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 space-y-20">
          <BundleSection mainProduct={product} />
          {recipes?.length > 0 && <RecipeList recipes={recipes} navigate={navigate} />}
          <RelatedProducts products={relatedProducts} />
          <ReviewsContainer id="reviews" />
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