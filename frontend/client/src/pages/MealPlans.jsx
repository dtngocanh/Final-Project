import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Apple,
  Flame,
  GraduationCap,
  PartyPopper,
  Dumbbell,
  Leaf,
  Zap,
  Clock,
  Heart,
  Dices,
  ChevronRight,
} from "lucide-react";
import FloatingDecor from "../components/Fruit/FloatingDecor";

const MealPlans = () => {
  const navigate = useNavigate();

  // 1. STATE CHO BỘ LỌC TABS
  const [activeTab, setActiveTab] = useState("all");

  // 2. STATE ĐỂ CHẠY HIỆU ỨNG RANDOM
  const [isRolling, setIsRolling] = useState(false);

  const plans = [
    {
      id: "eat-clean",
      title: "Eat Clean Challenge",
      category: "detox",
      description:
        "Fresh, whole foods and plant-based recipes to detoxify your body and refresh your mind.",
      mealSetup: {
        breakfast: "Starter",
        main: "Vegetarian",
        side: "Side",
        dessert: "Dessert",
      },
      icon: <Apple className="text-[#77cd3a]" size={20} />,
      bgImage:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "strict-vegan",
      title: "100% Pure Vegan",
      category: "detox",
      description:
        "Strictly plant-derived meals crafted to support an ethical, vibrant, and sustainable lifestyle.",
      mealSetup: {
        breakfast: "Starter",
        main: "Vegan",
        side: "Vegetarian",
        dessert: "Dessert",
      },
      icon: <Leaf className="text-emerald-500" size={20} />,
      bgImage:
        "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "fitness-pro",
      title: "High-Protein Fitness",
      category: "fitness",
      description:
        "Packed with clean, plant-based proteins to fuel workouts, build muscle, and optimize recovery.",
      mealSetup: {
        breakfast: "Pasta",
        main: "Beef",
        side: "Seafood",
        dessert: "Starter",
      },
      icon: <Dumbbell className="text-red-500" size={20} />,
      bgImage:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "budget-student",
      title: "Dorm-Friendly Budget",
      category: "saving",
      description:
        "Quick, highly affordable, and delicious 15-minute recipes tailored for busy student lives.",
      mealSetup: {
        breakfast: "Miscellaneous",
        main: "Pasta",
        side: "Side",
        dessert: "Starter",
      },
      icon: <GraduationCap className="text-blue-500" size={20} />,
      bgImage:
        "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "weight-loss",
      title: "Low-Carb Slim Down",
      category: "fitness",
      description:
        "Calorie-conscious meal schedules focusing on high-fiber veggies to help burn fat naturally.",
      mealSetup: {
        breakfast: "Starter",
        main: "Seafood",
        side: "Vegetarian",
        dessert: "Side",
      },
      icon: <Flame className="text-orange-500" size={20} />,
      bgImage:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "keto-plant",
      title: "Keto Plant Power",
      category: "fitness",
      description:
        "High healthy fats, moderate plant protein, and ultra-low carbs to trigger continuous metabolic energy.",
      mealSetup: {
        breakfast: "Pork",
        main: "Chicken",
        side: "Beef",
        dessert: "Side",
      },
      icon: <Zap className="text-amber-500" size={20} />,
      bgImage:
        "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "quick-easy",
      title: "15-Min Express Meals",
      category: "saving",
      description:
        "Perfect for hectic schedules. No-fuss, lightning-fast setup without compromising nutritional value.",
      mealSetup: {
        breakfast: "Pasta",
        main: "Miscellaneous",
        side: "Starter",
        dessert: "Dessert",
      },
      icon: <Clock className="text-cyan-500" size={20} />,
      bgImage:
        "https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "heart-healthy",
      title: "Heart-Healthy Balance",
      category: "detox",
      description:
        "Low-sodium, cholesterol-free ingredients focusing on nuts, seeds, and grains to maximize cardiovascular vitality.",
      mealSetup: {
        breakfast: "Vegetarian",
        main: "Seafood",
        side: "Starter",
        dessert: "Dessert",
      },
      icon: <Heart className="text-pink-500" size={20} />,
      bgImage:
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "weekend-cheat",
      title: "Weekend Indulgence",
      category: "saving",
      description:
        "Rich, comforting, and savory treats—perfect for hosting a gathering or treating yourself.",
      mealSetup: {
        breakfast: "Pasta",
        main: "Pork",
        side: "Beef",
        dessert: "Dessert",
      },
      icon: <PartyPopper className="text-purple-500" size={20} />,
      bgImage:
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80",
    },
  ];

  // Xử lý lọc danh sách kế hoạch
  const filteredPlans =
    activeTab === "all" ? plans : plans.filter((p) => p.category === activeTab);

  // Hàm chuyển trang dùng chung để chuẩn hóa dữ liệu state truyền đi
  const handleNavigateDetail = (plan) => {
    navigate(`/meal-plan/${plan.id}`, {
      state: {
        title: plan.title,
        mealSetup: plan.mealSetup,
        description: plan.description, 
      },
    });
  };

  // Xử lý nút Thử vận may ngẫu nhiên
  const handleRandomize = () => {
    if (isRolling) return;
    setIsRolling(true);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * plans.length);
      const chosenPlan = plans[randomIndex];
      setIsRolling(false);
      handleNavigateDetail(chosenPlan);
    }, 1000);
  };

  return (
    <main className="relative min-h-screen bg-[#f8fafc] dark:bg-[#060606] pt-20 md:pt-28 pb-20 overflow-hidden">
      <FloatingDecor />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* TOP BAR: BACK BUTTON & RANDOM ROULETTE */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-12">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-400 hover:text-[#77cd3a] transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Home
          </button>

          <button
            onClick={handleRandomize}
            disabled={isRolling}
            className={`
              w-full sm:w-fit inline-flex items-center justify-center gap-2.5 
              bg-gradient-to-r from-[#77cd3a] to-[#62ab2e] text-white 
              px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider 
              shadow-md shadow-[#77cd3a]/20 hover:shadow-lg hover:shadow-[#77cd3a]/30 
              transition-all duration-300 active:scale-95 disabled:opacity-80 cursor-pointer
              ${isRolling ? "animate-bounce" : "hover:scale-[1.02]"}
            `}
          >
            <Dices size={16} className={isRolling ? "animate-spin" : ""} />
            {isRolling ? "Choosing your meal..." : "What to eat today? "}
          </button>
        </div>

        {/* HEADER */}
        <div className="mb-8 md:mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={12} className="text-[#77cd3a]" />
            <span className="text-[8px] uppercase tracking-[0.3em] text-[#77cd3a] font-semibold">
              Veggies Assistant
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-gray-900 dark:text-white">
            What Is Your Diet Lifestyle?
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-2 font-light max-w-xl">
            Select a goal and we will instantly generate a curated 7-day meal
            plan tailored just for you.
          </p>
        </div>

        {/* BỘ LỌC TABS */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 md:mb-10 pb-2 border-b border-gray-200/60 dark:border-white/5 snap-x">
          {[
            { id: "all", label: "All Goals" },
            { id: "detox", label: "Detox & Clean" },
            { id: "fitness", label: "Fitness & Muscle" },
            { id: "saving", label: "Easy & Saving" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 whitespace-nowrap snap-start cursor-pointer
                ${
                  activeTab === tab.id
                    ? "bg-[#77cd3a] text-white shadow-md shadow-[#77cd3a]/20"
                    : "bg-white dark:bg-[#0f0f0f] text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/5 hover:border-[#77cd3a]/40"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* GRID CARD - FLAT LAYOUT SHOWING CRISP IMAGE (NO MORE FLIP LAG) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => handleNavigateDetail(plan)}
              className="group relative bg-white dark:bg-[#0f0f0f] border border-gray-100 dark:border-white/5 rounded-[2rem] overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1.5 active:scale-[0.99] transition-all duration-300 cursor-pointer transform-gpu select-none"
            >
              {/* IMAGE BANNER ON TOP - 100% VISIBLE */}
              <div className="relative h-[160px] w-full overflow-hidden">
                <img
                  src={plan.bgImage}
                  alt={plan.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-[#0f0f0f]"></div>

                {/* ICON TAG BADGE ON TOP LEFT */}
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/40 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 dark:border-white/5 shadow-xs">
                  {plan.icon}
                </div>
              </div>

              {/* TEXT CONTENT INNER */}
              <div className="p-6 pt-2 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#77cd3a] transition-colors flex items-center justify-between">
                    {plan.title}
                    <ChevronRight
                      size={16}
                      className="text-neutral-300 group-hover:text-[#77cd3a] transition-all group-hover:translate-x-1"
                    />
                  </h3>

                  <p className="text-xs text-gray-500 dark:text-gray-400 font-light line-clamp-2 leading-relaxed mb-4">
                    {plan.description}
                  </p>

                  {/* ROUTINE PREVIEW LAYOUT */}
                  <div className="bg-neutral-50/70 dark:bg-white/5 p-3 rounded-2xl border border-neutral-100 dark:border-white/5 grid grid-cols-2 gap-2 mb-5">
                    {Object.entries(plan.mealSetup).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-white/90 dark:bg-[#141414] px-2.5 py-1.5 rounded-xl border border-gray-100 dark:border-white/5"
                      >
                        <div className="text-[8px] uppercase tracking-wider text-gray-400 font-bold">
                          {key}
                        </div>
                        <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 capitalize truncate">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CALL TO ACTION SOLID BUTTON */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigateDetail(plan);
                  }}
                  className="w-full bg-neutral-50 dark:bg-white/5 group-hover:bg-[#77cd3a] text-gray-700 dark:text-gray-300 group-hover:text-white text-xs font-bold uppercase py-3 rounded-xl tracking-wider transition-all duration-300 shadow-2xs cursor-pointer flex items-center justify-center gap-1"
                >
                  Start Challenge
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default MealPlans;
