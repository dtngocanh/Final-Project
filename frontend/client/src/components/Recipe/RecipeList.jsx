import React from "react";
import {
  Sparkles,
  ChefHat,
  ChevronRight,
} from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import RecipeCard from "./RecipeCard";

import "swiper/css";
import "swiper/css/navigation";

const RecipeList = ({ recipes, navigate }) => {
  if (!recipes?.length) return null;

  return (
    <section className="mt-32 relative">
      <div
        className="
        absolute inset-0
        bg-gradient-to-b
        from-[#77cd3a]/5
        to-transparent
        rounded-[60px]
        blur-3xl opacity-70
      "
      />

      <div className="relative z-10">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles
                size={12}
                className="text-[#77cd3a]"
              />

              <span
                className="
                text-[8px]
                uppercase
                tracking-[0.3em]
                text-[#77cd3a]
                font-semibold
              "
              >
                AI Recipe Picks
              </span>
            </div>

            <h2
              className="
              text-lg md:text-xl
              font-medium
              tracking-tight
              dark:text-white
            "
            >
              Recommended Meals
            </h2>
          </div>

          <button
            onClick={() =>
              navigate("/recipes", {
                state: { recipes },
              })
            }
            className="
            hidden md:flex
            items-center gap-2
            text-[10px]
            uppercase tracking-[0.25em]
            text-gray-500
            hover:text-[#77cd3a]
            transition-all
          "
          >
            <ChefHat size={12} />
            View All
            <ChevronRight size={12} />
          </button>
        </div>

        {/* SLIDER */}
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={20}
          slidesPerView={1.15}
          breakpoints={{
            640: {
              slidesPerView: 2.2,
            },
            1024: {
              slidesPerView: 3.2,
            },
            1280: {
              slidesPerView: 4.2,
            },
          }}
          className="overflow-hidden pb-4"
        >
          {recipes.map((meal, index) => (
            <SwiperSlide key={meal.idMeal}>
              <RecipeCard
                meal={meal}
                navigate={navigate}
                index={index}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default RecipeList;