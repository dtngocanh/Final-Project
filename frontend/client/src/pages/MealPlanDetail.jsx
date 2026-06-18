import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
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
    dessert: "Dessert" 
  };

  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    const fetchAndBuildSchedule = async () => {
      try {
        setLoading(true);

        // Đổ đồng thời dữ liệu từ 4 API categories biệt lập dựa theo thiết lập của nhóm người dùng
        const [resBF, resMain, resSide, resDessert] = await Promise.all([
          fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${mealSetup.breakfast}`).then(r => r.json()),
          fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${mealSetup.main}`).then(r => r.json()),
          fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${mealSetup.side}`).then(r => r.json()),
          fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${mealSetup.dessert}`).then(r => r.json()),
        ]);

        const listBF = resBF.meals || [];
        const listMain = resMain.meals || [];
        const listSide = resSide.meals || [];
        const listDessert = resDessert.meals || [];

        const schedule = {};

        // Tiến hành gán mâm cơm có tính toán so le vị trí chỉ số để không trùng món
        daysOfWeek.forEach((day, dayIndex) => {
          schedule[dayIndex] = {
            breakfast: [
              { ...listBF[dayIndex % listBF.length], label: "Breakfast Light" }
            ],
            lunch: [
              { ...listMain[(dayIndex * 2) % listMain.length], label: "Main Dish" },
              { ...listSide[(dayIndex * 2) % listSide.length], label: "Side Dish" },
              { ...listDessert[(dayIndex * 2) % listDessert.length], label: "Dessert" }
            ],
            dinner: [
              { ...listMain[(dayIndex * 2 + 1) % listMain.length], label: "Main Dish" },
              { ...listSide[(dayIndex * 2 + 1) % listSide.length], label: "Side Dish" },
              { ...listDessert[(dayIndex * 2 + 1) % listDessert.length], label: "Dessert" }
            ]
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

  // Component tái sử dụng để dựng khối mâm cơm theo buổi gọn gàng
  const renderMealSection = (title, mealsList) => (
    <div className="bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[32px] p-6">
      <h2 className="text-sm font-medium uppercase tracking-wider text-[#77cd3a] mb-4 border-b border-gray-100 dark:border-white/5 pb-2">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {mealsList.map((meal, idx) => (
          <div key={`${meal.idMeal}-${idx}`} className="relative group">
            {/* Tag định danh loại món ăn hiển thị ở góc trên */}
            <div className="absolute top-4 left-4 z-10 bg-black/75 backdrop-blur-md border border-white/10 text-white text-[8px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full group-hover:bg-[#77cd3a] transition-colors duration-300">
              {meal.label}
            </div>
            <RecipeCard meal={meal} navigate={navigate} index={idx} />
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
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-400 hover:text-[#77cd3a] transition-all mb-8"
        >
          <ArrowLeft size={14} /> Back to Plans
        </button>

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl font-light tracking-tight dark:text-white mb-2">
            {state?.title || "7-Day Combo Roadmap"}
          </h1>
          <p className="text-gray-400 text-xs font-light tracking-wide uppercase">
            Structured Course: Breakfast + Full course Lunch & Dinner
          </p>
        </div>

        {/* 7 DAYS TABS */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar border-b border-gray-100 dark:border-white/5">
          {daysOfWeek.map((day, index) => (
            <button
              key={day}
              onClick={() => setSelectedDayIndex(index)}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-full text-xs transition-all whitespace-nowrap
                ${selectedDayIndex === index 
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