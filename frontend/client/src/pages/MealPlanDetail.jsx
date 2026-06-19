import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Loader2, FileText } from "lucide-react";
import RecipeCard from "../components/Recipe/RecipeCard";
import FloatingDecor from "../components/Fruit/FloatingDecor";

const MealPlanDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Cấu hình mâm cơm mặc định để chống sập nếu người dùng F5 reload trang trực tiếp
  const mealSetup = state?.mealSetup || {
    breakfast: "Starter",
    main: "Vegetarian",
    side: "Side",
    dessert: "Dessert",
  };

  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Bộ từ điển mô tả động sinh ra dựa theo Category ăn uống để bổ trợ thông tin trực quan cho UI
  const generateDynamicDescription = (category, label, mealName) => {
    const lowerCat = String(category).toLowerCase();
    const lowerLabel = String(label).toLowerCase();

    if (lowerLabel.includes("breakfast")) {
      return `A refreshing light meal featuring curated ${category} elements to boost energy, increase metabolic rate, and sustain your active morning workflow effectively.`;
    }

    switch (lowerCat) {
      case "vegetarian":
      case "vegan":
        return `100% plant-derived culinary preparation. Rich in essential micronutrients and fibers, helping detoxify your digestive framework while maintaining excellent health.`;
      case "beef":
      case "chicken":
      case "pork":
        return `High-quality, lean muscle macronutrient fuel source. Perfectly seasoned and optimized to hit your metabolic daily protein benchmarks for active muscle recovery.`;
      case "seafood":
        return `Premium low-calorie aquatic food choice packed with clean Omega-3 fatty acids, promoting advanced heart longevity and long-term cardiovascular support.`;
      case "starter":
      case "side":
        return `A balanced appetizing dish carefully formulated with green produce or whole grains to perfectly balance out your full course dining progression.`;
      case "dessert":
        return `A clean, calorie-conscious culinary reward crafted to smoothly satisfying your natural sugar cravings without spiking vital blood insulin thresholds.`;
      default:
        return `Deliciously handcrafted standard meal block from our ${category} assortment, tailored to perfectly align with your current selected lifestyle roadmap.`;
    }
  };

  useEffect(() => {
    const fetchAndBuildSchedule = async () => {
      try {
        setLoading(true);

        // Đổ đồng thời dữ liệu từ 4 API categories biệt lập dựa theo thiết lập của nhóm người dùng
        const [resBF, resMain, resSide, resDessert] = await Promise.all([
          fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?c=${mealSetup.breakfast}`,
          ).then((r) => r.json()),
          fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?c=${mealSetup.main}`,
          ).then((r) => r.json()),
          fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?c=${mealSetup.side}`,
          ).then((r) => r.json()),
          fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?c=${mealSetup.dessert}`,
          ).then((r) => r.json()),
        ]);

        const listBF = resBF.meals || [];
        const listMain = resMain.meals || [];
        const listSide = resSide.meals || [];
        const listDessert = resDessert.meals || [];

        const schedule = {};

        // Tiến hành gán mâm cơm có tính toán so le vị trí chỉ số để không trùng món
        daysOfWeek.forEach((day, dayIndex) => {
          // Trích xuất các đối tượng thô từ API
          const rawBF = listBF[dayIndex % listBF.length] || {};
          const rawMainLunch = listMain[(dayIndex * 2) % listMain.length] || {};
          const rawSideLunch = listSide[(dayIndex * 2) % listSide.length] || {};
          const rawDessertLunch =
            listDessert[(dayIndex * 2) % listDessert.length] || {};

          const rawMainDinner =
            listMain[(dayIndex * 2 + 1) % listMain.length] || {};
          const rawSideDinner =
            listSide[(dayIndex * 2 + 1) % listSide.length] || {};
          const rawDessertDinner =
            listDessert[(dayIndex * 2 + 1) % listDessert.length] || {};

          schedule[dayIndex] = {
            breakfast: [
              {
                ...rawBF,
                label: "Breakfast Light",
                description: generateDynamicDescription(
                  mealSetup.breakfast,
                  "Breakfast Light",
                  rawBF.strMeal,
                ),
              },
            ],
            lunch: [
              {
                ...rawMainLunch,
                label: "Main Dish",
                description: generateDynamicDescription(
                  mealSetup.main,
                  "Main Dish",
                  rawMainLunch.strMeal,
                ),
              },
              {
                ...rawSideLunch,
                label: "Side Dish",
                description: generateDynamicDescription(
                  mealSetup.side,
                  "Side Dish",
                  rawSideLunch.strMeal,
                ),
              },
              {
                ...rawDessertLunch,
                label: "Dessert",
                description: generateDynamicDescription(
                  mealSetup.dessert,
                  "Dessert",
                  rawDessertLunch.strMeal,
                ),
              },
            ],
            dinner: [
              {
                ...rawMainDinner,
                label: "Main Dish",
                description: generateDynamicDescription(
                  mealSetup.main,
                  "Main Dish",
                  rawMainDinner.strMeal,
                ),
              },
              {
                ...rawSideDinner,
                label: "Side Dish",
                description: generateDynamicDescription(
                  mealSetup.side,
                  "Side Dish",
                  rawSideDinner.strMeal,
                ),
              },
              {
                ...rawDessertDinner,
                label: "Dessert",
                description: generateDynamicDescription(
                  mealSetup.dessert,
                  "Dessert",
                  rawDessertDinner.strMeal,
                ),
              },
            ],
          };
        });

        setWeeklySchedule(schedule);
      } catch (error) {
        console.error("Error creating structured menu course:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndBuildSchedule();
  }, [state?.mealSetup]);

  const currentDayData = weeklySchedule[selectedDayIndex];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#060606]">
        <Loader2 className="animate-spin text-[#77cd3a]" size={32} />
      </div>
    );
  }

  // Component tái sử dụng để dựng khối mâm cơm theo buổi gọn gàng kèm mô tả bổ sung
  const renderMealSection = (title, mealsList) => (
    <div className="bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[32px] p-6 shadow-2xs">
      <h2 className="text-sm font-bold uppercase tracking-wider text-[#77cd3a] mb-5 border-b border-gray-100 dark:border-white/5 pb-2.5 flex items-center gap-1.5">
        {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mealsList.map((meal, idx) => (
          <div
            key={`${meal.idMeal}-${idx}`}
            className="relative group bg-white dark:bg-[#0f0f0f] rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-300"
          >
            {/* THÂN TRÊN: CHỨA ẢNH VÀ TAG ĐỊNH DANH */}
            <div className="relative">
              {/* Tag định danh loại món ăn hiển thị ở góc trên */}
              <div className="absolute top-4 left-4 z-10 bg-black/75 backdrop-blur-md border border-white/10 text-white text-[8px] uppercase tracking-widest font-extrabold px-2.5 py-1 rounded-full group-hover:bg-[#77cd3a] transition-colors duration-300">
                {meal.label}
              </div>

              {/* COMPONENT THẺ THỰC ĐƠN */}
              <RecipeCard meal={meal} navigate={navigate} index={idx} />
            </div>

            {/* THÂN DƯỚI: KHU VỰC HIỂN THỊ MÔ TẢ PHÂN ĐOẠN ĐỘNG */}
            <div className="p-5 pt-1 flex-grow flex flex-col justify-between bg-white dark:bg-[#0f0f0f]">
              <div className="border-t border-dashed border-gray-100 dark:border-white/5 pt-3.5 mt-1">
                <div className="flex items-start gap-1.5 text-gray-400 dark:text-gray-500 mb-1">
                  <FileText size={12} className="mt-0.5 text-[#77cd3a]/70" />
                  <span className="text-[9px] uppercase tracking-wider font-bold">
                    Dietary Context
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-light leading-relaxed line-clamp-3">
                  {meal.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#060606] pt-24 pb-20 overflow-hidden">
      <FloatingDecor />

      <div className="relative z-10 max-w-7xl mx-auto px-5">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-400 hover:text-[#77cd3a] transition-all mb-8 cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Plans
        </button>

        {/* HEADER VỚI CHUỖI MÔ TẢ PHÒNG HỜ THÔNG MINH */}
        <div className="mb-8 max-w-2xl">
          <h1 className="text-2xl md:text-4xl font-light tracking-tight dark:text-white mb-2">
            {state?.title || "7-Day Combo Roadmap"}
          </h1>
          <p className="text-[#77cd3a] text-xs font-semibold tracking-wide mb-3 ">
            Structured Course: Breakfast & Full course Lunch & Dinner
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-light leading-relaxed">
            {state?.description || 
              `Welcome to your personalized ${state?.title || "Diet"} lifestyle roadmap. This structured 7-day routine provides clean, highly organized, and nutritionally optimal recipes explicitly mapped out to help achieve your ultimate wellness benchmarks.`}
          </p>
        </div>

        {/* 7 DAYS TABS */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar border-b border-gray-100 dark:border-white/5 snap-x">
          {daysOfWeek.map((day, index) => (
            <button
              key={day}
              onClick={() => setSelectedDayIndex(index)}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer snap-start
                ${
                  selectedDayIndex === index
                    ? "bg-[#77cd3a] text-white font-medium shadow-sm shadow-[#77cd3a]/20"
                    : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                }
              `}
            >
              <Calendar size={12} />
              {day}
            </button>
          ))}
        </div>

        {/* COMPREHENSIVE MEAL SECTIONS */}
        {currentDayData ? (
          <div className="flex flex-col gap-8">
            {renderMealSection("☀️ Breakfast", currentDayData.breakfast)}
            {renderMealSection("🌤️ Lunch Course", currentDayData.lunch)}
            {renderMealSection("🌙 Dinner Course", currentDayData.dinner)}
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center rounded-[28px] border border-dashed border-gray-200 dark:border-white/10 text-gray-400">
            No dynamic schedule structure found.
          </div>
        )}
      </div>
    </main>
  );
};

export default MealPlanDetail;