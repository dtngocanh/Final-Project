import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  PlayCircle,
  Clock3,
  ChefHat,
  Globe2,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
} from "lucide-react";

import { motion } from "framer-motion";

import { axiosInstance } from "../lib/axios.js";
import ProductCard from "../components/Products/ProductCard.jsx";
import { useCartActions } from "../hooks/useCartActions.jsx";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { bulkAddCartThunk } from "../store/slices/cartSlice.js";

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleCartAction } = useCartActions(); // Lấy hàm handle giỏ hàng

  const dispatch = useDispatch();

  const [showAllProducts, setShowAllProducts] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [matchedProducts, setMatchedProducts] = useState([]);
  const [isAddingAll, setIsAddingAll] = useState(false); // State đợi khi đang xử lý add hàng loạt

  // FETCH RECIPE
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`,
        );

        setRecipe(res.data.meals[0]);
      } catch (error) {
        console.log(error);
      }
    };

    fetchRecipe();
  }, [id]);

  // INGREDIENTS
  const ingredients = useMemo(() => {
    if (!recipe) return [];

    const arr = [];

    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];

      if (ingredient && ingredient.trim() !== "") {
        arr.push({
          ingredient,
          measure,
        });
      }
    }

    return arr;
  }, [recipe]);

  // FETCH PRODUCTS
  useEffect(() => {
    if (ingredients.length === 0) return;

    const fetchProducts = async () => {
      try {
        const ingredientNames = ingredients.map((i) => i.ingredient).join(",");

        const res = await axiosInstance.get(
          `/recipes/by-ingredients?ingredients=${ingredientNames}`,
        );

        setMatchedProducts(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchProducts();
  }, [ingredients]);

  const handleAddAllToCart = async () => {
    if (matchedProducts.length === 0) return;

    setIsAddingAll(true);

    try {
      const items = matchedProducts.map((p) => ({
        productId: p._id,
        quantity: 1,
      }));

      await dispatch(bulkAddCartThunk(items));

      toast.success(`${matchedProducts.length} ingredients added to your bag!`);
    } catch (err) {
      toast.error("Failed to add items!");
    } finally {
      setIsAddingAll(false);
    }
  };

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  const youtubeEmbedUrl = recipe.strYoutube?.replace("watch?v=", "embed/");

  return (
    <main className="min-h-screen bg-white dark:bg-[#060606] pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-5">
        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="
            flex items-center gap-2
            text-[10px]
            uppercase tracking-[0.25em]
            text-gray-400
            hover:text-[#77cd3a]
            transition-all
            mb-8
          "
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="grid lg:grid-cols-[340px_1fr] gap-10 items-start">
          {/* IMAGE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-28"
          >
            <div
              className="
                overflow-hidden
                rounded-[32px]
                border border-gray-100
                dark:border-white/5
                bg-white dark:bg-[#0d0d0d]
              "
            >
              <img
                src={recipe.strMealThumb}
                alt={recipe.strMeal}
                className="w-full h-[420px] object-cover"
              />
            </div>
          </motion.div>

          {/* CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* TITLE */}
            <div className="mb-6">
              <span
                className="
                  text-[8px]
                  uppercase tracking-[0.3em]
                  text-[#77cd3a]
                  font-semibold
                "
              >
                AI Cooking Recipe
              </span>

              <h1
                className="
                  text-3xl md:text-5xl
                  font-light
                  tracking-tight
                  dark:text-white
                  mt-3
                  leading-tight
                "
              >
                {recipe.strMeal}
              </h1>
            </div>

            {/* META */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div
                className="
                  flex items-center gap-2
                  px-4 py-2
                  rounded-full
                  bg-gray-100 dark:bg-white/5
                  text-sm dark:text-white
                "
              >
                <ChefHat size={14} />
                {recipe.strCategory}
              </div>

              <div
                className="
                  flex items-center gap-2
                  px-4 py-2
                  rounded-full
                  bg-[#77cd3a]/10
                  text-[#77cd3a]
                  text-sm
                "
              >
                <Globe2 size={14} />
                {recipe.strArea}
              </div>

              <div
                className="
                  flex items-center gap-2
                  px-4 py-2
                  rounded-full
                  bg-gray-100 dark:bg-white/5
                  text-sm text-gray-500
                "
              >
                <Clock3 size={14} />
                20 mins
              </div>
            </div>

            {/* INGREDIENTS */}
            <div
              className="
                rounded-[28px]
                border border-gray-100
                dark:border-white/5
                bg-gray-50 dark:bg-[#0d0d0d]
                p-6 mb-8
              "
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-medium dark:text-white">
                  Ingredients
                </h3>

                <span className="text-sm text-gray-400">
                  {ingredients.length} items
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {ingredients.map((item, index) => (
                  <div
                    key={index}
                    className="
                      flex items-center justify-between
                      rounded-2xl
                      bg-white dark:bg-black/20
                      border border-gray-100
                      dark:border-white/5
                      px-4 py-3
                    "
                  >
                    <span className="dark:text-white text-sm">
                      {item.ingredient}
                    </span>

                    <span className="text-[#77cd3a] text-sm">
                      {item.measure}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* PRODUCTS SECTIONS - ĐÃ CHÈN NÚT ADD ALL Ở ĐÂY */}
            {matchedProducts.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-5 gap-4">
                  <h3 className="text-xl font-medium dark:text-white">
                    Available In Veggies
                  </h3>

                  {/* NÚT THÊM TẤT CẢ NGUYÊN LIỆU VÀO GIỎ HÀNG */}
                  <button
                    onClick={handleAddAllToCart}
                    disabled={isAddingAll}
                    className={`
                      flex items-center gap-1.5
                      px-3.5 py-1.5
                      text-[9px] font-bold tracking-wider uppercase
                      rounded-full border transition-all duration-300 shadow-sm
                      ${
                        isAddingAll
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-[#77cd3a] text-white border-[#77cd3a] hover:bg-black hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white"
                      }
                    `}
                  >
                    <ShoppingBag size={11} />
                    {isAddingAll ? "Adding..." : "Add All To Cart"}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {(showAllProducts
                    ? matchedProducts
                    : matchedProducts.slice(0, 6)
                  ).map((product, index) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      index={index}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* VIEW MORE / SHOW LESS */}
            {matchedProducts.length > 6 && (
              <div className="flex justify-center mt-6 p-5">
                <button
                  onClick={() => setShowAllProducts(!showAllProducts)}
                  className="
                    group
                    h-11 px-5
                    rounded-full
                    border border-[#77cd3a]/20
                    bg-[#77cd3a]/5
                    hover:bg-[#77cd3a]
                    text-[#77cd3a]
                    hover:text-white
                    transition-all duration-300
                    flex items-center gap-2
                    text-[11px]
                    uppercase tracking-[0.25em]
                    font-semibold
                  "
                >
                  {showAllProducts ? (
                    <>
                      Show Less
                      <ChevronUp
                        size={14}
                        className="group-hover:-translate-y-0.5 transition"
                      />
                    </>
                  ) : (
                    <>
                      View More
                      <ChevronDown
                        size={14}
                        className="group-hover:translate-y-0.5 transition"
                      />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* INSTRUCTIONS */}
            <div
              className="
                rounded-[28px]
                border border-gray-100
                dark:border-white/5
                bg-gray-50 dark:bg-[#0d0d0d]
                p-6
              "
            >
              <h3 className="text-xl font-medium dark:text-white mb-5">
                Instructions
              </h3>

              <p
                className={`
                  text-[15px]
                  leading-8
                  text-gray-600 dark:text-gray-300
                  ${!expanded ? "line-clamp-6" : ""}
                `}
              >
                {recipe.strInstructions}
              </p>

              {recipe.strInstructions?.length > 300 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="
                    mt-4
                    text-sm
                    font-medium
                    text-[#77cd3a]
                  "
                >
                  {expanded ? "Read Less" : "Read More"}
                </button>
              )}

              {/* VIDEO TUTORIAL */}
              {recipe.strYoutube && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-medium dark:text-white">
                      Video Tutorial
                    </h3>

                    <div
                      className="
                        flex items-center gap-2
                        text-[#77cd3a]
                        text-sm
                      "
                    >
                      <PlayCircle size={16} />
                      Cooking Guide
                    </div>
                  </div>

                  <div
                    className="
                      overflow-hidden
                      rounded-[28px]
                      border border-gray-100
                      dark:border-white/5
                      bg-black
                    "
                  >
                    <iframe
                      src={youtubeEmbedUrl}
                      title={recipe.strMeal}
                      allowFullScreen
                      loading="lazy"
                      className="
                        w-full
                        aspect-video
                      "
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default RecipeDetail;
