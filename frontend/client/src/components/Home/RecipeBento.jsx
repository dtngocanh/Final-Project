import React, { useState, useEffect } from "react";
import { Sparkles, ArrowUpRight, Flame, PlayCircle, ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecipeBento = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch và RANDOM 4 món ăn thay vì cố định
  useEffect(() => {
    const fetchBentoRecipes = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood"
        );
        const data = await response.json();
        
        if (data.meals) {
          // Xáo trộn ngẫu nhiên mảng món ăn
          const shuffledMeals = data.meals.sort(() => 0.5 - Math.random());
          // Lấy 4 món đầu tiên sau khi đã xáo trộn
          setRecipes(shuffledMeals.slice(0, 4));
        }
      } catch (error) {
        console.error("Lỗi fetch recipe bento:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBentoRecipes();
  }, []);

  // 2. Hiệu ứng Parallax 3D
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width - 0.5) * 15;
    const y = ((clientY - top) / height - 0.5) * -15;
    setCoords({ x, y });
  };
  const handleMouseLeave = () => setCoords({ x: 0, y: 0 });

  // 3. SKELETON LOADING
  if (loading || recipes.length < 4) {
    return (
      <div className="w-full max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
        <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 mx-auto mb-3 rounded-full"></div>
        <div className="h-8 w-64 bg-neutral-200 dark:bg-neutral-800 mx-auto mb-12 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[250px] lg:auto-rows-[300px] gap-4 lg:gap-6">
          <div className="md:col-span-2 md:row-span-2 bg-neutral-200 dark:bg-neutral-800 rounded-[32px]"></div>
          <div className="bg-neutral-200 dark:bg-neutral-800 rounded-[32px]"></div>
          <div className="bg-neutral-200 dark:bg-neutral-800 rounded-[32px]"></div>
          <div className="md:col-span-2 bg-neutral-200 dark:bg-neutral-800 rounded-[32px]"></div>
        </div>
      </div>
    );
  }

  return (
    <section className="relative w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-[1450px] mx-auto select-none bg-transparent overflow-hidden">
      
      {/* HEADER SECTION */}
      <div className="relative flex flex-col items-center text-center mb-12 md:mb-16 gap-3 z-10">
        <div className="flex items-center gap-3 text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#4a7c59]">
          <span className="w-6 h-[1px] bg-[#4a7c59]/40"></span>
          <div className="flex items-center gap-1.5">
            {/* <Sparkles size={14} /> */}
            <span>Culinary Art</span>
          </div>
          <span className="w-6 h-[1px] bg-[#4a7c59]/40"></span>
        </div>
        
        <h4 className="text-xl md:text-2xl lg:text-3xl font-extralight tracking-[0.15em] text-neutral-900 dark:text-neutral-100 font-fredoka leading-none">
          <span >Foolproof</span>{""}
          <span className="font-serif italic text-neutral-400 dark:text-neutral-500 lowercase ml-1.5 font-normal tracking-normal inline-block transform translate-y-[1px]">
            recipes
          </span>
        </h4>
      </div>

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[250px] lg:auto-rows-[300px] gap-4 lg:gap-6 relative z-10">
        
        {/* CARD 1: MASSIVE FEATURED RECIPE */}
        <div
          onClick={() => navigate(`/recipe/${recipes[0].idMeal}`, { state: { meal: recipes[0] } })}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(1000px) rotateX(${coords.y}deg) rotateY(${coords.x}deg)`,
            transition: coords.x === 0 ? "transform 0.5s ease-out" : "none"
          }}
          className="md:col-span-2 md:row-span-2 rounded-[32px] overflow-hidden relative group cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-[#77cd3a]/10 border border-neutral-200 dark:border-neutral-800"
        >
          <img
            src={recipes[0].strMealThumb}
            alt={recipes[0].strMeal}
            className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
          
          <span className="absolute top-6 left-6 text-[10px] uppercase tracking-widest bg-black/30 backdrop-blur-md text-white font-bold px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
            <Flame size={14} className="text-orange-400" /> Signature
          </span>

          <div className="absolute bottom-6 left-6 right-6 p-6 rounded-[24px] bg-white/10 dark:bg-black/30 backdrop-blur-xl border border-white/20 flex items-end justify-between transform transition-transform duration-500 group-hover:translate-y-[-8px]">
            <div className="flex flex-col gap-2 text-white pr-4">
              <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-[#77cd3a]">Chef's Special</span>
              <h5 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight line-clamp-2 leading-tight">
                {recipes[0].strMeal}
              </h5>
            </div>
            <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <ArrowUpRight size={24} strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* CARD 2: SMALL RECIPE TOP-RIGHT */}
        <div
          onClick={() => navigate(`/recipe/${recipes[1].idMeal}`, { state: { meal: recipes[1] } })}
          className="rounded-[32px] overflow-hidden relative group cursor-pointer border border-neutral-200 dark:border-neutral-800"
        >
          <img src={recipes[1].strMealThumb} alt={recipes[1].strMeal} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 text-white flex justify-between items-end">
            <h6 className="font-light text-lg tracking-tight line-clamp-2 pr-2">{recipes[1].strMeal}</h6>
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shrink-0">
              <ArrowUpRight size={16} />
            </div>
          </div>
        </div>

        {/* CARD 3: SMALL RECIPE TOP-RIGHT */}
        <div
          onClick={() => navigate(`/recipe/${recipes[2].idMeal}`, { state: { meal: recipes[2] } })}
          className="rounded-[32px] overflow-hidden relative group cursor-pointer border border-neutral-200 dark:border-neutral-800"
        >
          <img src={recipes[2].strMealThumb} alt={recipes[2].strMeal} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 text-white flex justify-between items-end">
            <h6 className="font-light text-lg tracking-tight line-clamp-2 pr-2">{recipes[2].strMeal}</h6>
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shrink-0">
              <ArrowUpRight size={16} />
            </div>
          </div>
        </div>

        {/* CARD 4: THE CINEMATIC VIDEO BACKGROUND */}
        <div
          className="md:col-span-2 rounded-[32px] overflow-hidden relative group cursor-pointer border border-neutral-200 dark:border-neutral-800 flex items-center justify-center bg-black"
        >
          {/* Đã cập nhật link video ổn định hơn. Khuyến nghị: Tải video về thư mục public của bạn! */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[2s] ease-out opacity-60"
            src="/cookingvid.mp4" 
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
          
          <div className="relative z-10 flex flex-col items-center justify-center text-white text-center p-6 transform transition-transform duration-500 group-hover:scale-105">
            <PlayCircle size={48} strokeWidth={1} className="mb-3 opacity-80 group-hover:opacity-100 group-hover:text-[#77cd3a] transition-all" />
            <h5 className="text-xl md:text-2xl font-light tracking-wide drop-shadow-md">Behind The Scenes</h5>
            <p className="text-xs md:text-sm text-neutral-200 font-extralight mt-1 tracking-wider uppercase drop-shadow-md">Watch our master chefs</p>
          </div>

          <div className="absolute top-5 right-5 text-white/70">
             <ChefHat size={20} />
          </div>
        </div>

      </div>
    </section>
  );
};

export default RecipeBento;