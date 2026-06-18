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
  Citrus,
  Grape,
  Banana,
  Dices,
  Eye
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
      description: "Fresh, whole foods and plant-based recipes to detoxify your body and refresh your mind.",
      mealSetup: {
        breakfast: "Starter",
        main: "Vegetarian",
        side: "Side",
        dessert: "Dessert"
      },
      icon: <Apple className="text-[#77cd3a]" size={24} />,
      bgImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "strict-vegan",
      title: "100% Pure Vegan",
      category: "detox",
      description: "Strictly plant-derived meals crafted to support an ethical, vibrant, and sustainable lifestyle.",
      mealSetup: {
        breakfast: "Starter",
        main: "Vegan",
        side: "Vegetarian",
        dessert: "Dessert"
      },
      icon: <Leaf className="text-emerald-500" size={24} />,
      bgImage: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "fitness-pro",
      title: "High-Protein Fitness",
      category: "fitness",
      description: "Packed with clean, plant-based proteins to fuel workouts, build muscle, and optimize recovery.",
      mealSetup: {
        breakfast: "Pasta", 
        main: "Beef",       
        side: "Seafood",    
        dessert: "Starter"  
      },
      icon: <Dumbbell className="text-red-500" size={24} />,
      bgImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "budget-student",
      title: "Dorm-Friendly Budget",
      category: "saving",
      description: "Quick, highly affordable, and delicious 15-minute recipes tailored for busy student lives.",
      mealSetup: {
        breakfast: "Miscellaneous", 
        main: "Pasta",              
        side: "Side",
        dessert: "Starter"
      },
      icon: <GraduationCap className="text-blue-500" size={24} />,
      bgImage: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "weight-loss",
      title: "Low-Carb Slim Down",
      category: "fitness",
      description: "Calorie-conscious meal schedules focusing on high-fiber veggies to help burn fat naturally.",
      mealSetup: {
        breakfast: "Starter",
        main: "Seafood",   
        side: "Vegetarian", 
        dessert: "Side"
      },
      icon: <Flame className="text-orange-500" size={24} />,
      bgImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "keto-plant",
      title: "Keto Plant Power",
      category: "fitness",
      description: "High healthy fats, moderate plant protein, and ultra-low carbs to trigger continuous metabolic energy.",
      mealSetup: {
        breakfast: "Pork",     
        main: "Chicken",
        side: "Beef",          
        dessert: "Side"
      },
      icon: <Zap className="text-amber-500" size={24} />,
      bgImage: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "quick-easy",
      title: "15-Min Express Meals",
      category: "saving",
      description: "Perfect for hectic schedules. No-fuss, lightning-fast setup without compromising nutritional value.",
      mealSetup: {
        breakfast: "Pasta",
        main: "Miscellaneous", 
        side: "Starter",
        dessert: "Dessert"
      },
      icon: <Clock className="text-cyan-500" size={24} />,
      bgImage: "https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "heart-healthy",
      title: "Heart-Healthy Balance",
      category: "detox",
      description: "Low-sodium, cholesterol-free ingredients focusing on nuts, seeds, and grains to maximize cardiovascular vitality.",
      mealSetup: {
        breakfast: "Vegetarian",
        main: "Seafood",   
        side: "Starter",
        dessert: "Dessert"
      },
      icon: <Heart className="text-pink-500" size={24} />,
      bgImage: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "weekend-cheat",
      title: "Weekend Indulgence",
      category: "saving",
      description: "Rich, comforting, and savory treats—perfect for hosting a gathering or treating yourself.",
      mealSetup: {
        breakfast: "Pasta",
        main: "Pork",       
        side: "Beef",
        dessert: "Dessert"  
      },
      icon: <PartyPopper className="text-purple-500" size={24} />,
      bgImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80",
    },
  ];

  // Xử lý lọc danh sách kế hoạch
  const filteredPlans = activeTab === "all" ? plans : plans.filter(p => p.category === activeTab);

  // Xử lý nút Thử vận may ngẫu nhiên
  const handleRandomize = () => {
    if (isRolling) return;
    setIsRolling(true);
    
    // Giả lập hiệu ứng xoay ngẫu nhiên trong vòng 1 giây
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * plans.length);
      const chosenPlan = plans[randomIndex];
      setIsRolling(false);
      navigate(`/meal-plan/${chosenPlan.id}`, { state: { title: chosenPlan.title, mealSetup: chosenPlan.mealSetup } });
    }, 1000);
  };

  return (
    <main className="relative min-h-screen bg-[#f8fafc] dark:bg-[#060606] pt-24 pb-20 overflow-hidden">
      <FloatingDecor />

      <div className="relative z-10 max-w-7xl mx-auto px-5">
        
        {/* TOP BAR: BACK BUTTON & RANDOM ROULETTE */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-400 hover:text-[#77cd3a] transition-all"
          >
            <ArrowLeft size={14} />
            Back to Home
          </button>

          {/* TÍNH NĂNG 1: NÚT THỬ VẬN MAY RANDOM */}
          <button
            onClick={handleRandomize}
            disabled={isRolling}
            className={`
              w-full sm:w-fit inline-flex items-center justify-center gap-2.5 
              bg-gradient-to-r from-[#77cd3a] to-[#62ab2e] text-white 
              px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider 
              shadow-md shadow-[#77cd3a]/20 hover:shadow-lg hover:shadow-[#77cd3a]/30 
              transition-all duration-300 active:scale-95 disabled:opacity-80
              ${isRolling ? "animate-bounce" : "hover:scale-[1.03]"}
            `}
          >
            <Dices size={16} className={isRolling ? "animate-spin" : ""} />
            {isRolling ? "Choosing your meal..." : "What to eat today? "}
          </button>
        </div>

        {/* HEADER */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={12} className="text-[#77cd3a]" />
            <span className="text-[8px] uppercase tracking-[0.3em] text-[#77cd3a] font-semibold">
              Veggies Assistant
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-light tracking-tight text-gray-900 dark:text-white">
            What Is Your Diet Lifestyle?
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 font-light">
            Select a goal and we will instantly generate a curated 7-day meal plan tailored just for you.
          </p>
        </div>

        {/* TÍNH NĂNG 2: BỘ LỌC TABS CỐ ĐỊNH TỐC HÀNH */}
        <div className="flex flex-wrap gap-2 mb-10 pb-2 border-b border-gray-200/60 dark:border-white/5">
          {[
            { id: "all", label: "All Goals" },
            { id: "detox", label: "Detox & Clean " },
            { id: "fitness", label: "Fitness & Muscle " },
            { id: "saving", label: "Easy & Saving " }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300
                ${activeTab === tab.id 
                  ? "bg-[#77cd3a] text-white shadow-md shadow-[#77cd3a]/20" 
                  : "bg-white dark:bg-[#0f0f0f] text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/5 hover:border-[#77cd3a]/40"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* GRID CHOOSING WITH 3D FLIP CARD EFFECT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 [perspective:1000px]">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="group relative h-[250px] w-full [transform-style:preserve-3d] transition-all duration-700 hover:[transform:rotateY(180deg)] cursor-pointer"
            >
              
              {/* MẶT TRƯỚC (FRONT SIDE CARD) */}
              <div className="absolute inset-0 [backface-visibility:hidden] rounded-[32px] overflow-hidden border border-gray-100 dark:border-white/5 bg-white dark:bg-[#0f0f0f] flex items-end p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] group-hover:shadow-none transition-all duration-500">
                {/* IMAGE & GRADIENT BACKGROUND */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img 
                    src={plan.bgImage} 
                    alt={plan.title}
                    className="w-full h-full object-cover opacity-50 dark:opacity-20 transition-all duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#77cd3a]/25 via-[#77cd3a]/10 to-transparent dark:from-[#77cd3a]/10 dark:to-transparent"></div>
                  
                  {/* ICON NỀN TRANG TRÍ */}
                  <div className="absolute top-4 right-6 text-[#77cd3a]/15 group-hover:translate-y-1 transition-all duration-700">
                    <Apple size={48} strokeWidth={1} />
                  </div>
                </div>

                {/* TEXT CONTENT */}
                <div className="relative z-10 w-full">
                  <div className="flex justify-between items-end mb-4">
                    <div className="bg-white/90 dark:bg-white/10 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 backdrop-blur-sm">
                      {plan.icon}
                    </div>
                    {/* ICON CON MẮT GỢI Ý HÀNH ĐỘNG XEM TRƯỚC */}
                    <div className="text-gray-400 opacity-60 flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider mb-1">
                      <Eye size={12} /> Preview Menu
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1.5">
                    {plan.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 font-medium leading-relaxed">
                    {plan.description}
                  </p>
                </div>
              </div>

              {/* MẶT SAU (BACK SIDE CARD) - HIỂN THỊ TÍNH NĂNG 3: PREVIEW MEAL SETUP CHUYÊN NGHIỆP */}
              <div 
                onClick={() => navigate(`/meal-plan/${plan.id}`, { state: { title: plan.title, mealSetup: plan.mealSetup } })}
                className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[32px] border-2 border-[#77cd3a]/40 bg-gradient-to-br from-[#fafff6] to-[#eef9e6] dark:from-[#0d140b] dark:to-[#060a04] p-6 flex flex-col justify-between shadow-[0_12px_30px_-6px_rgba(119,205,58,0.2)]"
              >
                <div>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-extrabold text-[#77cd3a] bg-[#77cd3a]/10 px-2.5 py-1 rounded-full">
                    Plan Overview
                  </span>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-white mt-3 mb-4">
                    7-Day Routine Framework:
                  </h4>
                  
                  {/* DANH SÁCH DIỄN GIẢI 4 PHÂN KHÚC MÓN ĂN */}
                  <div className="grid grid-cols-2 gap-3 text-left">
                    {Object.entries(plan.mealSetup).map(([key, value]) => (
                      <div key={key} className="bg-white/70 dark:bg-white/5 p-2 rounded-xl border border-gray-200/40 dark:border-white/5">
                        <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">{key}</div>
                        <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 capitalize truncate">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA BUTTON TẠI MẶT SAU CỦA THẺ */}
                <button className="w-full bg-[#77cd3a] hover:bg-[#62ab2e] text-white text-xs font-bold uppercase py-3 rounded-2xl tracking-widest transition-all">
                  Generate Full Plan →
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