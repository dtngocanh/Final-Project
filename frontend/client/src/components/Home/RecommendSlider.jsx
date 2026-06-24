import React, { useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  Leaf,
  Carrot,
  Citrus,
} from "lucide-react";
import FloatingDecor from "../Fruit/FloatingDecor.jsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecommendations } from "../../store/slices/recommendSlice.js";
import { addToCartThunk } from "../../store/slices/cartSlice.js";
import { addToRecentlyViewed } from "../../store/slices/interactionSlice.js";
import { toast } from "react-toastify";

const RecommendSlider = () => {
  const scrollRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Đồng bộ đúng state từ slice "recommend"
  const {
    list = [],
    type = "trending",
    isLoading,
  } = useSelector((state) => state.recommend);

  useEffect(() => {
    dispatch(fetchRecommendations());
  }, [dispatch]);

  // Lọc sản phẩm hợp lệ và còn hàng
  const products = useMemo(() => {
    return (list || []).filter((p) => p && p._id && p.stock > 0);
  }, [list]);

  // Xử lý khi người dùng bấm xem chi tiết sản phẩm gợi ý
  const handleProductDetailClick = (e, product) => {
    e.preventDefault();
    dispatch(addToRecentlyViewed(product));
    navigate(`/product/${product._id}`);
  };

  // Hiệu ứng ảnh bay mượt mà vào giỏ hàng
  const handleFlyToCart = (e, product) => {
    e.preventDefault();

    const cardContainer = e.currentTarget.closest(".group\\/card");
    const productImage = cardContainer?.querySelector(".product-img-target");
    const cartIcon = document.getElementById("navbar-cart-icon");

    try {
      dispatch(
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

      const translateX = targetLeft - imgRect.left;
      const translateY = targetTop - imgRect.top;

      flyImg.style.setProperty("--fly-X", `${translateX}px`);
      flyImg.style.setProperty("--fly-Y", `${translateY}px`);
      flyImg.style.setProperty("--target-width", `${targetWidth}px`);
      flyImg.style.setProperty("--target-height", `${targetHeight}px`);

      document.body.appendChild(flyImg);

      const animationDuration = 1100;

      setTimeout(() => {
        flyImg.remove();
        cartIcon.classList.add("cart-bounce-feedback");
        setTimeout(() => {
          cartIcon.classList.remove("cart-bounce-feedback");
        }, 300);
      }, animationDuration);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const clientWidth = scrollRef.current.clientWidth;
      const amount =
        direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;

      scrollRef.current.scrollBy({
        left: amount,
        behavior: "smooth",
      });
    }
  };

  // 🔥 ĐÃ CẬP NHẬT: Loại bỏ hoàn toàn trường product.discount cũ không có trong DB.
  // Chỉ tính toán trực tiếp dựa vào giá trị thực tế của price và discountPrice.
  const renderProductTag = (product) => {
    let tagText = product.tag;
    let tagClass =
      "bg-neutral-900/10 text-neutral-800 dark:bg-white/10 dark:text-neutral-200";

    if (!tagText) {
      if (
        product.discountPrice > 0 &&
        product.price > 0 &&
        product.discountPrice < product.price
      ) {
        const calculatedDiscount = Math.round(
          ((product.price - product.discountPrice) / product.price) * 100,
        );
        tagText = `-${calculatedDiscount}%`;
        tagClass =
          "bg-rose-500 text-white font-semibold animate-pulse shadow-md";
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
        className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-10 px-1.5 py-0.5 sm:px-2.5 rounded-full text-[8px] sm:text-[9px] font-bold tracking-wider sm:tracking-wide uppercase select-none backdrop-blur-md max-w-[70px] sm:max-w-none truncate text-center transition-all ${tagClass}`}
      >
        {tagText}
      </span>
    );
  };

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="relative py-12 md:py-20 bg-white dark:bg-[#020202] overflow-hidden transition-colors duration-1000">
      <FloatingDecor />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
        {/* HEADER - Tự động đổi text dựa vào trạng thái fallback/SVD gợi ý */}
        <div className="flex flex-col items-center mb-10 md:mb-16 text-center select-none">
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-12 h-12 flex items-center justify-center mb-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[#77cd3a]/30 via-transparent to-transparent p-[1px]"
                style={{
                  WebkitMask:
                    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
              />
              <img
                src="/logohaha.png"
                alt="logo"
                className="w-6 h-6 object-contain relative z-10"
              />
            </div>
            <span className="text-[10px] font-bold tracking-[0.3em] text-[#77cd3a] uppercase">
              {type === "personalized" ? "Personalized Picks" : "Trending Now"}
            </span>
          </div>

          <div className="relative max-w-2xl mx-auto w-full space-y-2">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white flex items-center justify-center gap-3">
              <span className="h-[1px] w-6 md:w-12 bg-neutral-200 dark:bg-neutral-800 rounded-full hidden sm:block" />
              <span className="font-fredoka text-neutral-900 dark:text-neutral-100">
                {type === "personalized" ? "Just for you" : "Hot Products"}
              </span>
              <span className="h-[1px] w-6 md:w-12 bg-neutral-200 dark:bg-neutral-800 rounded-full hidden sm:block" />
            </h3>

            <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto font-normal leading-relaxed tracking-wide">
              {type === "personalized"
                ? "Handpicked organic products tailored to your healthy lifestyle."
                : "The most popular organic choices loved by our community."}
            </p>
          </div>
        </div>

        {/* SLIDER WRAPPER */}
        <div className="relative group/slider">
          {/* NAVIGATION BUTTONS */}
          <button
            onClick={() => scroll("left")}
            className="absolute top-1/2 -left-5 -translate-y-1/2 z-20 hidden lg:flex p-2.5 rounded-full bg-white dark:bg-neutral-950 shadow-md border border-neutral-200/50 dark:border-neutral-800 text-neutral-500 hover:text-[#77cd3a] opacity-0 group-hover/slider:opacity-100 transition-all duration-300"
            aria-label="Scroll Left"
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>

          <button
            onClick={() => scroll("right")}
            className="absolute top-1/2 -right-5 -translate-y-1/2 z-20 hidden lg:flex p-2.5 rounded-full bg-white dark:bg-neutral-950 shadow-md border border-neutral-200/50 dark:border-neutral-800 text-neutral-500 hover:text-[#77cd3a] opacity-0 group-hover/slider:opacity-100 transition-all duration-300"
            aria-label="Scroll Right"
          >
            <ChevronRight size={18} strokeWidth={2} />
          </button>

          {/* SLIDER CONTENT */}
          <div
            ref={scrollRef}
            className="mobile-slider grid grid-flow-col grid-rows-1 md:grid-rows-2 gap-4 md:gap-6 overflow-x-auto pb-6 pt-2 px-1"
          >
            {products.map((product) => (
              <div
                key={product._id}
                className="w-[155px] sm:w-[185px] md:w-[225px] lg:w-[245px] flex-shrink-0 snap-start group/card h-full"
              >
                <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/60 rounded-2xl md:rounded-[1.75rem] overflow-hidden transition-all duration-400 ease-out hover:border-[#77cd3a]/40 hover:shadow-[0_20px_40px_rgba(119,205,58,0.08)] relative">
                  <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#77cd3a]/4 via-transparent to-transparent group-hover/card:from-[#77cd3a]/18 group-hover/card:via-[#77cd3a]/4 transition-all duration-500 pointer-events-none z-0" />

                  {/* ICON RAU CỦ TRÔI NỔI */}
                  <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-all duration-700 pointer-events-none z-10 overflow-hidden">
                    <div className="absolute bottom-14 -left-1 w-5 h-5 text-[#77cd3a]/25 dark:text-[#77cd3a]/15 -rotate-12 transform group-hover/card:animate-float-slow">
                      <Carrot size={18} />
                    </div>
                    <div className="absolute top-1/2 -right-2 w-5 h-5 text-[#77cd3a]/20 dark:text-[#77cd3a]/10 rotate-45 transform group-hover/card:animate-float-fast">
                      <Citrus size={16} />
                    </div>
                    <div className="absolute top-16 left-2 w-4 h-4 text-[#77cd3a]/25 dark:text-[#77cd3a]/15 rotate-12 transform group-hover/card:animate-float-medium">
                      <Leaf size={14} fill="currentColor" />
                    </div>
                    <div className="absolute bottom-16 right-3 w-1.5 h-1.5 rounded-full bg-[#77cd3a]/30 group-hover/card:animate-pulse" />
                  </div>

                  {/* UPPER PART: IMAGE BOX */}
                  <div className="relative w-full aspect-[4/3] md:aspect-square p-3 sm:p-4 md:p-5 flex items-center justify-center rounded-t-2xl md:rounded-t-[1.75rem] overflow-hidden z-10">
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex items-center gap-0.5 bg-white/90 dark:bg-neutral-950/90 px-1.5 py-0.5 rounded-md text-[9px] font-bold text-neutral-600 dark:text-neutral-400 border border-neutral-200/30 dark:border-neutral-800/50 backdrop-blur-md">
                      <Star
                        size={8}
                        fill="#77cd3a"
                        className="text-[#77cd3a]"
                      />
                      <span>{product.ratings?.toFixed(1) || "0.0"}</span>
                    </div>

                    {renderProductTag(product)}

                    <div
                      onClick={(e) => handleProductDetailClick(e, product)}
                      className="w-full h-full flex items-center justify-center p-2 relative z-10 cursor-pointer"
                    >
                      <img
                        src={
                          product.images?.[0]?.url ||
                          product.image ||
                          "/placeholder.png"
                        }
                        alt={product.name}
                        className="product-img-target max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-500 ease-out group-hover/card:scale-[1.03] mix-blend-multiply dark:mix-blend-normal dark:brightness-95"
                        loading="lazy"
                      />
                    </div>

                    <button
                      onClick={(e) => handleFlyToCart(e, product)}
                      className="absolute bottom-3 right-3 w-8 h-8 md:w-9 md:h-9 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 rounded-full flex items-center justify-center shadow-xs md:opacity-0 group-hover/card:opacity-100 transition-all duration-300 hover:!bg-[#77cd3a] hover:!text-white z-20"
                      aria-label="Add to cart"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* LOWER PART: INFOS */}
                  <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 min-h-[95px] md:min-h-[110px] relative z-20 bg-transparent">
                    <div className="w-full space-y-1">
                      <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold">
                        <Leaf
                          size={8}
                          className="text-[#77cd3a] flex-shrink-0"
                        />
                        <span className="truncate max-w-full">
                          {product.reason || "Organic Pick"}
                        </span>
                      </div>
                      <h4 className="text-xs md:text-sm font-semibold text-neutral-800 dark:text-neutral-200 tracking-tight truncate transition-colors duration-200 group-hover/card:text-neutral-950 dark:group-hover/card:text-white">
                        {product.name}
                      </h4>
                    </div>

                    {/* HIỂN THỊ GIÁ CẢ KHỚP DB: Chỉ check discountPrice so với price */}
                    <div className="pt-2 mt-auto border-t border-neutral-100 dark:border-neutral-800/40 flex items-center justify-between">
                      <div className="flex items-center gap-x-1.5 flex-wrap">
                        {product.discountPrice > 0 &&
                        product.discountPrice < product.price ? (
                          <>
                            <span className="text-xs md:text-sm font-bold text-[#77cd3a]">
                              ${Number(product.discountPrice).toFixed(2)}
                            </span>
                            <span className="text-[10px] md:text-xs text-neutral-400 dark:text-neutral-500 line-through font-normal">
                              ${Number(product.price).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs md:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                            ${Number(product.price || 0).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-[#77cd3a] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 hidden sm:inline-block">
                        Detail →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* SHOW ALL BLOCK */}
            <div className="flex-shrink-0 w-[110px] sm:w-[130px] flex flex-col items-center justify-center snap-start pl-2 md:row-span-2">
              <Link
                to="/products"
                className="group/all flex flex-col items-center gap-1.5"
              >
                <div className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-dashed border-neutral-300 dark:border-neutral-800 flex items-center justify-center group-hover/all:border-[#77cd3a] group-hover/all:bg-[#77cd3a]/5 transition-all duration-300">
                  <ArrowRight
                    size={14}
                    className="text-neutral-400 group-hover/all:text-[#77cd3a] transition-transform group-hover/all:translate-x-0.5"
                  />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 group-hover/all:text-[#77cd3a] select-none text-center">
                  View All
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .mobile-slider {
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch; 
          touch-action: pan-x; 
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .mobile-slider::-webkit-scrollbar {
          display: none; 
        }

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
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--fly-X), var(--fly-Y)) scale(0.12);
            width: var(--target-width);
            height: var(--target-height);
            opacity: 0;
          }
        }

        .cart-bounce-feedback {
          animation: miniPop 0.3s ease-out both;
        }
        @keyframes miniPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(-12deg); }
          50% { transform: translateY(-7px) rotate(-18deg); }
        }
        @keyframes floatMedium {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(12deg); }
          50% { transform: translateY(-5px) translateX(4px) rotate(8deg); }
        }
        @keyframes floatFast {
          0%, 100% { transform: translateY(0px) rotate(45deg); }
          50% { transform: translateY(-9px) rotate(35deg); }
        }

        .animate-float-slow { animation: floatSlow 4.5s ease-in-out infinite; }
        .animate-float-medium { animation: floatMedium 3.5s ease-in-out infinite; }
        .animate-float-fast { animation: floatFast 2.8s ease-in-out infinite; }
      `}</style>
    </section>
  );
};

export default RecommendSlider;
