import React from "react";
import { motion } from "framer-motion";
import { Clock3, Flame } from "lucide-react";

const RecipeCard = ({ meal, navigate, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.04,
      }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/recipe/${meal.idMeal}`)}
      className="group h-full cursor-pointer"
    >
      <div
        className="
          h-full flex flex-col
          overflow-hidden
          rounded-[24px]
          bg-white dark:bg-[#0d0d0d]
          border border-gray-100
          dark:border-white/5
          hover:border-[#77cd3a]/30
          hover:shadow-2xl
          hover:shadow-[#77cd3a]/5
          transition-all duration-500
        "
      >
        {/* IMAGE */}
        <div className="relative overflow-hidden">
          <img
            src={meal.strMealThumb}
            alt={meal.strMeal}
            className="
              w-full h-[220px]
              object-cover
              group-hover:scale-105
              transition-transform duration-700
            "
          />

          {/* OVERLAY */}
          <div
            className="
              absolute inset-0
              bg-gradient-to-t
              from-black/50
              via-black/5
              to-transparent
              opacity-0 group-hover:opacity-100
              transition-opacity duration-500
            "
          />

          {/* BADGE */}
          <div
            className="
              absolute top-3 left-3
              px-3 py-1.5
              rounded-full
              bg-black/50 backdrop-blur-md
              text-white
              text-[9px]
              uppercase tracking-[0.25em]
              font-semibold
            "
          >
            AI PICK
          </div>

          {/* VIEW DETAIL */}
          <div
            className="
              absolute inset-0
              flex items-center justify-center
              opacity-0 group-hover:opacity-100
              transition-all duration-500
            "
          >
            <div
              className="
                px-5 py-2.5
                rounded-full
                bg-white/90
                text-black
                text-[10px]
                uppercase tracking-[0.25em]
                font-bold
                backdrop-blur-md
              "
            >
              View Recipe
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-5 flex flex-col flex-1">
          {/* CATEGORY */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="
                text-[10px]
                uppercase tracking-[0.25em]
                text-gray-400
              "
            >
              {meal.strCategory}
            </span>

            <span
              className="
                text-[10px]
                uppercase tracking-[0.25em]
                text-[#77cd3a]
              "
            >
              {meal.strArea}
            </span>
          </div>

          {/* TITLE */}
          <h3
            className="
              text-[18px]
              font-medium
              dark:text-white
              leading-snug
              line-clamp-2
              h-[52px]
              transition-colors duration-300
              group-hover:text-[#77cd3a]
            "
          >
            {meal.strMeal}
          </h3>

          {/* META */}
          <div className="flex items-center gap-2 mt-4">
            <div
              className="
                flex items-center gap-1
                px-2.5 py-1.5
                rounded-full
                bg-gray-100 dark:bg-white/5
                text-xs text-gray-500
              "
            >
              <Clock3 size={12} />
              20m
            </div>

            <div
              className="
                flex items-center gap-1
                px-2.5 py-1.5
                rounded-full
                bg-[#77cd3a]/10
                text-[#77cd3a]
                text-xs
              "
            >
              <Flame size={12} />
              Healthy
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecipeCard;