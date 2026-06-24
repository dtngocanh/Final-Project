import React, { useRef, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import { fetchAllProducts } from "../../store/slices/productSlice";

import { addToRecentlyViewed } from "../../store/slices/interactionSlice";

import {
  ChevronLeft,
  ChevronRight,
  Star,
  Plus,
  Leaf,
  Carrot,
  Citrus,
} from "lucide-react";

import { motion } from "framer-motion";

import { useNavigate } from "react-router-dom";

import FloatingDecor from "../Fruit/FloatingDecor";

import FruitLoader from "../Fruit/FruitLoader";

import { addToCartThunk } from "../../store/slices/cartSlice";
import { toast } from "react-toastify";

const ProductSlider = ({
  title = "Seasonal Picks",

  products: incomingProducts,

  loading: incomingLoading,
}) => {
  const scrollRef = useRef(null);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { products: storeProducts, loading: storeLoading } = useSelector(
    (state) => state.product,
  );

  const products =
    incomingProducts !== undefined ? incomingProducts : storeProducts;

  const isLoading =
    incomingLoading !== undefined ? incomingLoading : storeLoading;

  const scrollVelocity = useRef(0);

  const isAnimationLoopRunning = useRef(false);

  useEffect(() => {
    if (incomingProducts === undefined) {
      dispatch(fetchAllProducts({ limit: 30, page: 1 }));
    }
  }, [dispatch, incomingProducts]);

  // QUẢN LÝ WHEEL SCROLL KHÔNG BỊ KHỰNG

  useEffect(() => {
    const slider = scrollRef.current;

    if (!slider) return;

    const smoothScrollLoop = () => {
      if (Math.abs(scrollVelocity.current) < 0.2) {
        scrollVelocity.current = 0;

        isAnimationLoopRunning.current = false;

        return;
      }

      slider.scrollLeft += scrollVelocity.current;

      scrollVelocity.current *= 0.88;

      requestAnimationFrame(smoothScrollLoop);
    };

    const handleWheelScroll = (e) => {
      if (window.innerWidth >= 1024) {
        const absX = Math.abs(e.deltaX);

        const absY = Math.abs(e.deltaY);

        if (absY > absX || (absY > 0 && absX === 0)) {
          return;
        }

        if (e.deltaX !== 0) {
          e.preventDefault();

          scrollVelocity.current += e.deltaX * 0.15;

          scrollVelocity.current = Math.max(
            Math.min(scrollVelocity.current, 50),

            -50,
          );

          if (!isAnimationLoopRunning.current) {
            isAnimationLoopRunning.current = true;

            requestAnimationFrame(smoothScrollLoop);
          }
        }
      }
    };

    slider.addEventListener("wheel", handleWheelScroll, { passive: false });

    return () => slider.removeEventListener("wheel", handleWheelScroll);
  }, []);

  // HÀM XỬ LÝ KHI USER BẤM VÀO XEM CHI TIẾT SẢN PHẨM

  const handleProductDetailClick = (e, product) => {
    e.preventDefault();

    dispatch(addToRecentlyViewed(product));

    navigate(`/product/${product._id}`);
  };

  // HÀM XỬ LÝ HIỆU ỨNG ẢNH BAY

  const handleFlyToCart = async (e, product) => {
    e.preventDefault();

    e.stopPropagation();

    const cardContainer = e.currentTarget.closest(".group");

    const productImage = cardContainer?.querySelector(".product-img-target");

    const cartIcon = document.getElementById("navbar-cart-icon");

    if (product.stock <= 0) {
      toast.error("Not enough stock available", {
        position: "bottom-right",
      });
      return;
    }
    try {
      await dispatch(
        addToCartThunk({ productId: product._id, quantity: 1 }),
      ).unwrap();
      toast.success("Added to cart successfully", {
        position: "bottom-right",
      });
    } catch (error) {
      toast.error(error);
    }

    if (productImage && cartIcon) {
      const imgRect = productImage.getBoundingClientRect();

      const cartRect = cartIcon.getBoundingClientRect();

      const flyImg = document.createElement("img");

      flyImg.src = productImage.src;

      flyImg.className = "fly-to-cart-element";

      const initialWidth = imgRect.width;

      const initialHeight = imgRect.height;

      flyImg.style.width = `${initialWidth}px`;

      flyImg.style.height = `${initialHeight}px`;

      flyImg.style.left = `${imgRect.left}px`;

      flyImg.style.top = `${imgRect.top}px`;

      const targetWidth = 24;

      const targetHeight = 24;

      const targetLeft = cartRect.left + cartRect.width / 2 - targetWidth / 2;

      const targetTop = cartRect.top + cartRect.height / 2 - targetHeight / 2;

      flyImg.style.setProperty("--fly-X", `${targetLeft - imgRect.left}px`);

      flyImg.style.setProperty("--fly-Y", `${targetTop - imgRect.top}px`);

      flyImg.style.setProperty("--target-width", `${targetWidth}px`);

      flyImg.style.setProperty("--target-height", `${targetHeight}px`);

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

  const scroll = (direction) => {
    if (scrollRef.current) {
      const cardWidth = window.innerWidth < 768 ? 190 : 284;

      scrollRef.current.scrollBy({
        left: direction === "left" ? -cardWidth : cardWidth,

        behavior: "smooth",
      });
    }
  };

  // CẬP NHẬT: Tự động tính toán tag % giảm giá theo discountPrice thực tế từ database

  const renderProductTag = (product) => {
    let tagText = product.tag;

    let tagClass =
      "bg-neutral-900/10 text-neutral-800 dark:bg-white/10 dark:text-neutral-200";

    if (!tagText) {
      if (product.discountPrice > 0 && product.price > 0) {
        // Tính % giảm giá thực tế làm tròn số

        const calculatedDiscount = Math.round(
          ((product.price - product.discountPrice) / product.price) * 100,
        );

        tagText = `-${calculatedDiscount}%`;

        tagClass = "bg-rose-500 text-white font-medium";
      } else if (product.discount > 0) {
        tagText = `-${product.discount}%`;

        tagClass = "bg-rose-500 text-white font-medium";
      } else if (product.ratings >= 4.8) {
        tagText = (
          <>
            <span className="inline sm:hidden">Best</span>

            <span className="hidden sm:inline">Best Seller</span>
          </>
        );

        tagClass = "bg-[#77cd3a] text-white font-medium";
      } else {
        return null;
      }
    }

    return (
      <span
        className={`absolute top-2 right-2 sm:top-4 sm:right-4 z-10 px-1.5 py-0.5 sm:px-2.5 rounded-full text-[8px] sm:text-[9px] font-bold tracking-wider sm:tracking-wide uppercase select-none shadow-xs backdrop-blur-md max-w-[70px] sm:max-w-none truncate text-center ${tagClass}`}
      >
        {tagText}
      </span>
    );
  };

  const chunkedProducts = React.useMemo(() => {
    if (!products || !Array.isArray(products)) return [];

    const chunks = [];

    for (let i = 0; i < products.length; i += 2) {
      chunks.push(products.slice(i, i + 2));
    }

    return chunks;
  }, [products]);

  if (isLoading && (!products || products.length === 0)) return <FruitLoader />;

  if (!products || products.length === 0) {
    return (
      <section className="py-12 bg-white dark:bg-[#030303] text-center text-neutral-400 font-extralight tracking-wider uppercase text-xs">
        {title} Series is empty
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 bg-white dark:bg-[#030303] overflow-hidden transition-colors duration-500 relative">
      <FloatingDecor />

      <div className="max-w-[1450px] mx-auto px-4 sm:px-8 relative z-10">
        <div className="flex items-center justify-between mb-8 md:mb-12 border-b border-neutral-100 dark:border-white/5 pb-4 md:pb-6">
          <h2 className="text-xl md:text-3xl font-extralight tracking-tight text-gray-950 dark:text-white uppercase leading-none">
            {title}{" "}
            <span className="font-serif italic lowercase text-neutral-400">
              series
            </span>
          </h2>

          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors cursor-pointer"
            >
              <ChevronLeft
                size={24}
                strokeWidth={1.5}
                className="text-neutral-500"
              />
            </button>

            <button
              onClick={() => scroll("right")}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors cursor-pointer"
            >
              <ChevronRight
                size={24}
                strokeWidth={1.5}
                className="text-neutral-500"
              />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto snap-x sm:snap-none snap-mandatory no-scrollbar pb-6 px-1 will-change-scroll"
        >
          {chunkedProducts.map((pair, pairIdx) => (
            <div
              key={pairIdx}
              className="flex flex-col gap-4 md:gap-6 min-w-[170px] sm:min-w-[240px] md:min-w-[260px] max-w-[180px] sm:max-w-none snap-start"
            >
              {pair.map((product, idx) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: Math.min((pairIdx * 2 + idx) * 0.02, 0.3),

                    duration: 0.3,
                  }}
                  className="group relative w-full"
                >
                  <div className="relative flex flex-col bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-[2rem] overflow-hidden border border-neutral-100 dark:border-neutral-800/60 shadow-sm lg:hover:border-[#77cd3a]/40 lg:hover:shadow-[0_20px_40px_rgba(119,205,58,0.06)] transition-all duration-300 transform-gpu">
                    <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#77cd3a]/4 via-transparent to-transparent lg:group-hover:from-[#77cd3a]/18 lg:group-hover:via-[#77cd3a]/4 transition-all duration-300 pointer-events-none z-0" />

                    <div className="absolute inset-0 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 overflow-hidden">
                      <div className="absolute bottom-16 -left-1 w-5 h-5 text-[#77cd3a]/25 dark:text-[#77cd3a]/15 -rotate-12 transform lg:group-hover:animate-float-slow">
                        <Carrot size={18} />
                      </div>

                      <div className="absolute top-1/2 -right-2 w-5 h-5 text-[#77cd3a]/20 dark:text-[#77cd3a]/10 rotate-45 transform lg:group-hover:animate-float-fast">
                        <Citrus size={16} />
                      </div>

                      <div className="absolute top-16 left-2 w-4 h-4 text-[#77cd3a]/25 dark:text-[#77cd3a]/15 rotate-12 transform lg:group-hover:animate-float-medium">
                        <Leaf size={14} fill="currentColor" />
                      </div>

                      <div className="absolute bottom-20 right-3 w-1.5 h-1.5 rounded-full bg-[#77cd3a]/30 lg:group-hover:animate-pulse" />
                    </div>

                    <div
                      onClick={(e) => handleProductDetailClick(e, product)}
                      className="block relative w-full aspect-square overflow-hidden z-10 cursor-pointer"
                    >
                      <div className="w-full h-full flex items-center justify-center p-3 sm:p-4">
                        <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl border border-neutral-100 dark:border-white/5 bg-neutral-50 dark:bg-neutral-900/50 shadow-inner">
                          <img
                            src={product.images?.[0]?.url || "/placeholder.png"}
                            alt={product.name}
                            className="product-img-target w-[85%] h-[85%] object-contain lg:group-hover:scale-[1.04] transition-transform duration-500 ease-out mix-blend-multiply dark:mix-blend-normal dark:brightness-95"
                          />
                        </div>
                      </div>

                      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex items-center gap-0.5 sm:gap-1 bg-white/90 dark:bg-neutral-950/90 px-1.5 py-0.5 rounded-md backdrop-blur-md border border-neutral-200/30 dark:border-neutral-800/50">
                        <Star
                          size={8}
                          fill="#77cd3a"
                          className="text-[#77cd3a]"
                        />

                        <span className="text-[9px] font-bold text-neutral-600 dark:text-neutral-400">
                          {product.ratings?.toFixed(1) || "0.0"}
                        </span>
                      </div>

                      {renderProductTag(product)}
                    </div>

                    <div className="mx-4 sm:mx-8 h-[1px] bg-neutral-100 dark:bg-neutral-800/40 relative z-10" />

                    {/* CẬP NHẬT: Logic hiển thị giá gốc gạch ngang và giá giảm cực mượt */}

                    <div className="px-3 py-4 sm:px-6 sm:py-6 text-center relative z-20 bg-transparent">
                      <h3 className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1 sm:mb-1.5 truncate lg:group-hover:text-neutral-950 dark:lg:group-hover:text-white transition-colors duration-200 leading-tight">
                        {product.name}
                      </h3>

                      <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
                        {product.discountPrice > 0 ? (
                          <>
                            {/* Giá đã giảm màu xanh lá bắt mắt */}

                            <span className="text-xs sm:text-sm font-bold text-[#77cd3a]">
                              ${product.discountPrice?.toFixed(2)}
                            </span>

                            {/* Giá gốc cũ bị gạch ngang nhỏ hơn ở bên cạnh */}

                            <span className="text-[10px] sm:text-xs text-neutral-400 dark:text-neutral-500 line-through font-normal">
                              ${product.price?.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          /* Nếu không giảm giá, hiển thị giá thường mặc định */

                          <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                            ${product.price?.toFixed(2)}
                          </span>
                        )}

                        <span className="text-[8px] sm:text-[9px] text-neutral-400 font-medium uppercase tracking-tight">
                          / per kg
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleFlyToCart(e, product)}
                      className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 md:bottom-[82px] md:right-5 w-8 h-8 sm:w-9 sm:h-9 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 rounded-full flex items-center justify-center shadow-xs active:scale-90 md:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 hover:!bg-[#77cd3a] hover:!text-white z-30 cursor-pointer"
                      aria-label="Add to cart"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style>{`

        .no-scrollbar::-webkit-scrollbar { display: none; }

        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .will-change-scroll { will-change: scroll-left; }

       

        .fly-to-cart-element {

          position: fixed;

          object-fit: contain;

          z-index: 99999;

          pointer-events: none;

          mix-blend-mode: multiply;

          animation: absoluteStraightFly 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;

          transform-origin: center center;

        }

       

        .dark .fly-to-cart-element {

          mix-blend-mode: normal;

          filter: brightness(0.95);

        }

       

        @keyframes absoluteStraightFly {

          0% { transform: translate(0, 0) scale(1); opacity: 1; }

          100% { transform: translate(var(--fly-X), var(--fly-Y)) scale(0.12); width: var(--target-width); height: var(--target-height); opacity: 0; }

        }

        .cart-bounce-feedback { animation: miniPop 0.3s ease-out both; }

        @keyframes miniPop { 0% { transform: scale(1); } 50% { transform: scale(1.12); } 100% { transform: scale(1); } }

        @keyframes floatSlow { 0%, 100% { transform: translateY(0px) rotate(-12deg); } 50% { transform: translateY(-5px) rotate(-16deg); } }

        @keyframes floatMedium { 0%, 100% { transform: translateY(0px) translateX(0px) rotate(12deg); } 50% { transform: translateY(-4px) translateX(3px) rotate(9deg); } }

        @keyframes floatFast { 0%, 100% { transform: translateY(0px) rotate(45deg); } 50% { transform: translateY(-6px) rotate(38deg); } }

        .animate-float-slow { animation: floatSlow 5s ease-in-out infinite; }

        .animate-float-medium { animation: floatMedium 4s ease-in-out infinite; }

        .animate-float-fast { animation: floatFast 3.2s ease-in-out infinite; }

      `}</style>
    </section>
  );
};

export default ProductSlider;
