import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";

import RecipeCard from "../components/Recipe/RecipeCard";

const Recipes = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const recipes = state?.recipes || [];

  return (
    <main className="min-h-screen bg-white dark:bg-[#060606] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-5">
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

        {/* HEADER */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={12} className="text-[#77cd3a]" />

              <span
                className="
                  text-[8px]
                  uppercase
                  tracking-[0.3em]
                  text-[#77cd3a]
                  font-semibold
                "
              >
                AI Recipe Collection
              </span>
            </div>

            <h1
              className="
                text-2xl md:text-4xl
                font-light
                tracking-tight
                dark:text-white
              "
            >
              Recommended Meals
            </h1>
          </div>

          <div className="hidden md:block text-[10px] uppercase tracking-[0.25em] text-gray-400 ">
            {recipes.length} Meals
          </div>
        </div>

        {/* EMPTY */}
        {recipes.length === 0 && (
          <div
            className="
              h-[300px]
              flex items-center justify-center
              rounded-[28px]
              border border-dashed
              border-gray-200 dark:border-white/10
              text-gray-400
            "
          >
            No recipes found
          </div>
        )}

        {/* GRID */}
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
            gap-6
          "
        >
          {recipes.map((meal, index) => (
            <RecipeCard
              key={meal.idMeal}
              meal={meal}
              navigate={navigate}
              index={index}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default Recipes;
