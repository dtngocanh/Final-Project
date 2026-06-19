import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Carrot, Citrus, Cherry, Salad, Leaf, Frown } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchMyOrders, selectPantryItems } from '../store/slices/orderSlice';
import { fetchRecipes, fetchBestRecipe } from "../store/slices/recommendSlice";
import PantryItem from "../components/Pantry/PantryItem.jsx";

// ========================================================
// COMPONENT RAU CỦ TRÔI NỔI NỀN NGHỆ THUẬT
// ========================================================
const FloatingDecor = () => {
  const decorItems = [
    { Icon: Carrot, size: 100, top: "10%", left: "5%", rotate: 15, delay: 0 },
    { Icon: Citrus, size: 140, top: "60%", left: "2%", rotate: -20, delay: 2 },
    { Icon: Cherry, size: 80, bottom: "15%", right: "35%", rotate: 45, delay: 1 },
    { Icon: Salad, size: 120, top: "20%", right: "5%", rotate: -10, delay: 3 },
    { Icon: Leaf, size: 90, bottom: "10%", left: "40%", rotate: 30, delay: 4 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] bg-[#82cd47]/5 blur-[130px] rounded-full" />
      {decorItems.map((item, index) => (
        <motion.div
          key={index}
          className="absolute hidden md:block opacity-[0.25]"
          style={{
            top: item.top, left: item.left, right: item.right, bottom: item.bottom,
          }}
          animate={{
            y: [0, 35, 0],
            rotate: [item.rotate, item.rotate + 20, item.rotate],
          }}
          transition={{
            duration: 12 + index * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: item.delay,
          }}
        >
          <item.Icon size={item.size} strokeWidth={0.8} className="text-[#82cd47]" />
        </motion.div>
      ))}
    </div>
  );
};

// ========================================================
// COMPONENT CHÍNH: PANTRY PAGE (ORGANIC STYLE)
// ========================================================
const PantryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const rawItems = useSelector(selectPantryItems) || [];
  
  const [isOpened, setIsOpened] = useState(false);
  const [selectedDemoRecipe, setSelectedDemoRecipe] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [matchedFridgeItems, setMatchedFridgeItems] = useState([]); 
  const [floatingRecipes, setFloatingRecipes] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  
  // State quản lý khi KHÔNG có recipe phù hợp
  const [noRecipeAlert, setNoRecipeAlert] = useState(false); 
  const [noComboFound, setNoComboFound] = useState(false);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const items = React.useMemo(() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    return rawItems.filter(item => {
      const addedDate = new Date(item.addedAt || item.createdAt || new Date());
      return addedDate >= oneMonthAgo;
    });
  }, [rawItems]);

  const floatingPositions = [
    { id: "cb-1", top: "15%", left: "20px", side: "left", startX: 280, startY: 140, endX: 200 },
    { id: "cb-2", top: "38%", right: "20px", side: "right", startX: 616, startY: 295, endX: 696 },
    { id: "cb-3", top: "60%", left: "30px", side: "left", startX: 280, startY: 440, endX: 210 },
    { id: "cb-4", top: "80%", right: "30px", side: "right", startX: 616, startY: 575, endX: 686 }
  ];

  // Quét tự động combo khi mở tủ
  useEffect(() => {
    if (!isOpened) {
      setFloatingRecipes([]);
      setIsScanning(false);
      setNoComboFound(false);
      return;
    }
    if (!items || items.length === 0) return;

    const loadBestComboMeals = async () => {
      try {
        setIsScanning(true);
        setNoComboFound(false);
        const ingredientQuery = items
          .map(i => (i.name || i.product?.name || "").trim().toLowerCase())
          .filter(Boolean)
          .join(",");

        if (!ingredientQuery) {
          setIsScanning(false);
          return;
        }

        const res = await dispatch(fetchBestRecipe(ingredientQuery)).unwrap();
        const recipeList = Array.isArray(res) ? res : (res.recipes || [res.recipe].filter(Boolean));

        if (recipeList && recipeList.length > 0) {
          const mappedRecipes = recipeList.slice(0, 4).map((recipe, idx) => ({
            ...recipe,
            ...floatingPositions[idx]
          }));
          
          setTimeout(() => {
            setFloatingRecipes(mappedRecipes);
            setIsScanning(false);
          }, 1200);
        } else {
          setIsScanning(false);
          setNoComboFound(true); // Báo không tìm thấy tổ hợp món ăn nào
        }
      } catch (error) {
        console.error("Error fetching combo:", error);
        setIsScanning(false);
        setNoComboFound(true);
      }
    };

    loadBestComboMeals();
  }, [isOpened, dispatch]);

  const animateIngredientsToPot = (targetMatches) => {
    setTimeout(() => {
      const cookingPot = document.getElementById("ai-cooking-pot");
      if (!cookingPot) return;

      const potRect = cookingPot.getBoundingClientRect();
      const targetLeft = potRect.left + potRect.width / 2 - 20;
      const targetTop = potRect.top + potRect.height / 2 - 20;

      targetMatches.forEach((item, index) => {
        const itemElement = document.querySelector(`[alt="${item.name}"]`);
        if (!itemElement) return;

        const imgRect = itemElement.getBoundingClientRect();
        const bubbleParticle = document.createElement("img");
        bubbleParticle.src = itemElement.src;
        bubbleParticle.className = "cute-bubble-particle";
        
        bubbleParticle.style.left = `${imgRect.left}px`;
        bubbleParticle.style.top = `${imgRect.top}px`;
        bubbleParticle.style.width = `${imgRect.width}px`;
        bubbleParticle.style.height = `${imgRect.height}px`;

        bubbleParticle.style.setProperty("--target-X", `${targetLeft - imgRect.left}px`);
        bubbleParticle.style.setProperty("--target-Y", `${targetTop - imgRect.top}px`);
        bubbleParticle.style.animationDelay = `${index * 0.12}s`;

        document.body.appendChild(bubbleParticle);

        setTimeout(() => {
          bubbleParticle.remove();
          cookingPot.classList.add("pot-boing-feedback");
          setTimeout(() => cookingPot.classList.remove("pot-boing-feedback"), 500);
        }, 850);
      });
    }, 100);
  };

  const handleFloatingMealClick = (meal) => {
    setSelectedDemoRecipe(meal);
    setNoRecipeAlert(false);
    const matchedNames = meal.matchStats?.matchedIngredients || meal.ingredients || [];
    const realMatches = items.filter(item => {
      const name = (item.name || item.product?.name || "").toLowerCase();
      return matchedNames.some(mn => name.includes(mn.toLowerCase()) || mn.toLowerCase().includes(name));
    });
    const finalMatches = realMatches.length > 0 ? realMatches : items.slice(0, 1);
    setMatchedFridgeItems(finalMatches);
    animateIngredientsToPot(finalMatches);
  };

  // Click vào từng nguyên liệu đơn lẻ bên trong tủ
  const handleItemClick = async (clickedItem) => {
    const ingredientName = clickedItem.name || clickedItem.product?.name;
    if (!ingredientName) return;

    try {
      setIsFetching(true);
      setNoRecipeAlert(false);
      const recipes = await dispatch(fetchRecipes([ingredientName.trim().toLowerCase()])).unwrap();
      
      if (recipes && recipes.length > 0) {
        setSelectedDemoRecipe(recipes[0]);
        setMatchedFridgeItems([clickedItem]); 
        animateIngredientsToPot([clickedItem]);
      } else {
        // Nếu không có recipe cho nguyên liệu này
        setSelectedDemoRecipe(null);
        setMatchedFridgeItems([clickedItem]);
        setNoRecipeAlert(true); 
      }
    } catch (error) {
      console.error(error);
      setNoRecipeAlert(true);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f1f7ec] text-slate-700 font-fredoka overflow-x-hidden relative select-none">
      
      <FloatingDecor />

      {/* NÚT QUAY LẠI CỬA HÀNG */}
      <div className="max-w-5xl mx-auto pt-6 px-6 relative z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-500 hover:text-[#82cd47] rounded-2xl font-black text-xs uppercase tracking-wider shadow-[0_4px_0_#e2e8f0] active:translate-y-0.5 active:shadow-[0_2px_0_#e2e8f0] transition-all duration-100"
        >
          <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-0.5 transition-transform" /> 
          Back to Shop
        </button>
      </div>

      {/* KHU VỰC TIÊU ĐỀ CHÍNH */}
      <div className="max-w-5xl mx-auto pt-6 pb-4 px-6 flex flex-col items-center text-center relative z-30">
        <span className="px-4 py-1.5 rounded-full bg-[#82cd47]/10 text-[#64a331] text-xs font-bold tracking-wider mb-3 border border-[#82cd47]/20 shadow-xs">
          ✦ Fresh Choice 01
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-800 mb-2 uppercase">
          My Virtual Fridge
        </h1>
        <p className="text-slate-500 text-xs max-w-xs mb-6 font-medium leading-relaxed">
          Tap the handles to reveal fresh, organic items inside your magical cooler!
        </p>
        <button 
          onClick={() => { 
            setIsOpened(!isOpened); 
            setSelectedDemoRecipe(null);
            setNoRecipeAlert(false);
          }}
          className="px-8 py-3.5 bg-[#82cd47] hover:bg-[#74be37] text-white rounded-2xl font-black text-sm tracking-wide shadow-[0_8px_0_#5a9827] hover:shadow-[0_6px_0_#5a9827] active:translate-y-1 active:shadow-none transition-all duration-150 relative z-40"
        >
          {isOpened ? " CLOSE REFRIGERATOR " : " OPEN REFRIGERATOR "}
        </button>
      </div>

      {/* SÂN KHẤU TỦ LẠNH 3D */}
      <div className="w-full flex justify-center items-center pb-32 px-4 relative z-20">
        <div className="relative w-full max-w-4xl h-[670px] flex justify-center items-center">
          
          {/* THÔNG BÁO TỰ ĐỘNG KHI KHÔNG TÌM THẤY TỔ HỢP COMBO */}
          {isOpened && noComboFound && !selectedDemoRecipe && !noRecipeAlert && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-[2%] bg-amber-50 border-2 border-amber-200 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold shadow-sm z-50 flex items-center gap-2"
            >
              <Frown size={14} /> No combo recipes found with current ingredients!
            </motion.div>
          )}

          {/* SVG ĐƯỜNG NỐI LIÊN KẾT */}
          {isOpened && !selectedDemoRecipe && !noRecipeAlert && floatingRecipes.length > 0 && (
            <svg viewBox="0 0 896 670" className="absolute inset-0 w-full h-full pointer-events-none z-30 hidden md:block">
              {floatingRecipes.map((recipe, idx) => (
                <g key={`line-${idx}`}>
                  <motion.path
                    d={`M ${recipe.startX} ${recipe.startY} L ${recipe.endX} ${recipe.startY}`}
                    fill="none"
                    stroke="#c4deb1" 
                    strokeWidth="3"
                    strokeDasharray="6,6"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.7 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  />
                  <motion.circle
                    cx={recipe.startX}
                    cy={recipe.startY}
                    r="5"
                    fill="#c9f5a8"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  />
                </g>
              ))}
            </svg>
          )}

          {/* CÁC COMBO LƠ LỬNG */}
          {isOpened && !selectedDemoRecipe && !noRecipeAlert && floatingRecipes.map((recipe, idx) => (
            <motion.div 
              key={recipe.idMeal || idx}
              onClick={() => handleFloatingMealClick(recipe)} 
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 120, delay: idx * 0.08 }}
              className="absolute z-40 bg-white border-4 border-slate-100 p-3 pr-8 rounded-2xl shadow-xl flex items-center gap-3 cursor-pointer hover:border-[#82cd47] hover:scale-105 active:scale-95 transition-all duration-300 hidden md:flex animate-[bounce_3s_infinite]"
              style={{
                top: recipe.top, 
                left: recipe.left || 'auto', 
                right: recipe.right || 'auto',
                animationDelay: `${idx * 0.4}s`
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFloatingRecipes(prev => prev.filter(r => r.idMeal !== recipe.idMeal));
                }}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-50 hover:bg-rose-100 text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={12} strokeWidth={3} />
              </button>

              <img src={recipe.strMealThumb} alt="" className="w-11 h-11 rounded-xl object-cover shadow-inner" />
              <div>
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-wide">Organic Mix</p>
                <h4 className="text-xs font-black text-slate-700 whitespace-nowrap max-w-[110px] truncate">{recipe.strMeal}</h4>
              </div>
            </motion.div>
          ))}

          {/* CHÂN ĐẾ */}
          <div className="absolute bottom-[-12px] left-[28%] w-10 h-4 bg-slate-500 rounded-b-xl shadow-md z-10" />
          <div className="absolute bottom-[-12px] right-[28%] w-10 h-4 bg-slate-500 rounded-b-xl shadow-md z-10" />

          {/* THÂN TỦ LẠNH */}
          <div className="w-full max-w-md h-full bg-gradient-to-br from-[#a3d9a5] via-[#bfe6c1] to-[#92cf95] rounded-[56px] p-5 shadow-[0_24px_0_#c3dbb2,0_40px_60px_rgba(40,60,20,0.1)] border-4 border-white relative z-20">
            
            <div className="absolute top-7 left-7 bg-[#82cd47] text-[10px] text-white font-black px-2 py-0.5 rounded-lg rotate-[-10deg] shadow-xs uppercase tracking-wider pointer-events-none z-10">
              100% Pure
            </div>

            {isScanning && (
              <div className="absolute inset-5 rounded-[40px] bg-[#82cd47]/5 z-50 pointer-events-none overflow-hidden flex items-center justify-center">
                <div className="w-36 h-36 bg-[#82cd47]/20 rounded-full animate-radar-pulse-1" />
                <div className="w-36 h-36 bg-[#82cd47]/10 rounded-full absolute animate-radar-pulse-2" />
              </div>
            )}

            {/* KHOANG CHỨA ĐỒ BÊN TRONG */}
            <div className={`w-full h-full bg-[#fbfdfa] rounded-[40px] p-4 transition-all duration-500 overflow-y-auto overflow-x-hidden custom-fridge-scrollbar
                ${isOpened ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none filter blur-md'}`}
            >
              {items.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-center">
                  <span className="text-3xl mb-2">🌿</span>
                  <p className="text-xs font-bold uppercase tracking-wider">Your Fridge is Empty!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 items-stretch pb-6">
                  {items.map((item, i) => {
                    const normalizedItem = {
                      ...item,
                      name: item.name || item.product?.name,
                      image: item.image || item.product?.image || "https://via.placeholder.com/150",
                      addedAt: item.addedAt || new Date().toISOString(),
                      shelfLifeDays: item.shelfLifeDays || 7
                    };

                    return (
                      <div key={i} className="flex items-stretch bg-white rounded-2xl p-1 border-b-4 border-slate-50 shadow-2xs">
                        <PantryItem 
                          item={normalizedItem} 
                          onSuggest={handleItemClick}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CÁNH CỬA TỦ MÀU XANH LÁ HỮU CƠ */}
            <div className="absolute inset-5 rounded-[40px] overflow-hidden flex z-20 pointer-events-none">
              
              {/* Cánh Trái */}
              <div 
               className="w-1/2 h-full bg-gradient-to-br from-[#bfe6c1] via-[#d2f0d4] to-[#a3d9a5] border-r-[3px] border-white/60 cursor-pointer pointer-events-auto transition-transform duration-700 ease-out shadow-[inset_-8px_0_16px_rgba(0,0,0,0.06)] relative flex items-center justify-end"
                style={{ transform: isOpened ? 'translateX(-100%) rotateY(-15deg)' : 'translateX(0)', transformOrigin: 'left center' }}
                onClick={() => { 
                  setIsOpened(!isOpened); 
                  setSelectedDemoRecipe(null);
                  setNoRecipeAlert(false);
                }}
              >
                <div className="w-3 h-20 bg-gradient-to-r from-white to-slate-100 rounded-l-full mr-1.5 shadow-md border-y border-l border-green-700/20" />
              </div>

              {/* Cánh Phải */}
              <div 
                className="w-1/2 h-full bg-gradient-to-br from-[#bfe6c1] via-[#d2f0d4] to-[#a3d9a5] border-l-[3px] border-white/60 cursor-pointer pointer-events-auto transition-transform duration-700 ease-out shadow-[inset_8px_0_16px_rgba(0,0,0,0.06)] relative flex items-center justify-start"
                style={{ transform: isOpened ? 'translateX(100%) rotateY(15deg)' : 'translateX(0)', transformOrigin: 'right center' }}
                onClick={() => { 
                  setIsOpened(!isOpened); 
                  setSelectedDemoRecipe(null);
                  setNoRecipeAlert(false);
                }}
              >
                <div className="w-3 h-20 bg-gradient-to-l from-white to-slate-100 rounded-r-full ml-1.5 shadow-md border-y border-r border-green-700/20" />
              </div>

            </div>

            {/* POPUP BẾP NẤU THÀNH CÔNG */}
            {selectedDemoRecipe && !noRecipeAlert && (
              <div className="absolute inset-0 bg-white/98 z-30 flex flex-col items-center justify-center p-6 rounded-[40px] border-4 border-slate-50">
                <div id="ai-cooking-pot" className="relative w-26 h-26 mb-4 rounded-full bg-[#f1f7ec] flex items-center justify-center border-4 border-dashed border-[#82cd47] shadow-md">
                  <img src={selectedDemoRecipe.strMealThumb} alt="" className="w-20 h-20 rounded-full object-cover shadow-md border-4 border-white" />
                </div>

                <h3 className="text-sm font-black text-slate-800 text-center uppercase tracking-wide max-w-xs px-2">{selectedDemoRecipe.strMeal}</h3>
                <p className="text-[10px] font-black text-[#64a331] tracking-wider mt-4 mb-2 uppercase">
                  ✨ Matched {matchedFridgeItems.length} Organic Item{matchedFridgeItems.length > 1 ? 's' : ''}
                </p>
                
                <div className="flex gap-2 mb-8 h-8">
                  {matchedFridgeItems.map((mItem, idx) => (
                    <div key={idx} className="w-8 h-8 rounded-xl border-2 border-slate-100 p-0.5 shadow-xs bg-white">
                      <img src={mItem.image || mItem.product?.image} alt="" className="w-full h-full object-cover rounded-lg" />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 w-full max-w-xs px-4">
                  <button onClick={() => navigate(`/recipe/${selectedDemoRecipe.idMeal}`)} className="flex-1 py-3.5 bg-[#82cd47] hover:bg-[#74be37] font-black text-xs rounded-2xl text-white shadow-[0_4px_0_#5a9827] active:translate-y-1 active:shadow-none transition-all">LET'S COOK</button>
                  <button onClick={() => setSelectedDemoRecipe(null)} className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 font-black text-xs rounded-2xl text-slate-500 transition-all">BACK</button>
                </div>
              </div>
            )}

            {/* ================= POPUP THÔNG BÁO KHÔNG CÓ RECIPE ================= */}
            {noRecipeAlert && (
              <div className="absolute inset-0 bg-white/98 z-30 flex flex-col items-center justify-center p-6 rounded-[40px] border-4 border-amber-100">
                <div className="w-20 h-20 mb-4 rounded-full bg-amber-50 flex items-center justify-center border-4 border-dashed border-amber-300">
                  <span className="text-4xl text-amber-500">😭</span>
                </div>

                <h3 className="text-sm font-black text-slate-800 text-center uppercase tracking-wide px-4">
                  Oops! No recipe found
                </h3>
                <p className="text-xs text-slate-400 text-center font-medium mt-1 max-w-xs leading-relaxed">
                  We couldn't find any specific match for "{(matchedFridgeItems[0]?.name || "this item")}" right now.
                </p>
                
                <div className="w-16 h-16 rounded-2xl border-2 border-slate-100 p-1 bg-slate-50 mt-4 mb-8">
                  <img src={matchedFridgeItems[0]?.image || matchedFridgeItems[0]?.product?.image} alt="" className="w-full h-full object-cover rounded-xl filter grayscale" />
                </div>

                <button 
                  onClick={() => setNoRecipeAlert(false)} 
                  className="w-full max-w-xs py-3.5 bg-slate-800 hover:bg-slate-900 font-black text-xs rounded-2xl text-white shadow-[0_4px_0_#1e293b] active:translate-y-0.5 active:shadow-none transition-all"
                >
                  CLOSE
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        .custom-fridge-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-fridge-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-fridge-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        
        @keyframes radarRipple {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .animate-radar-pulse-1 { animation: radarRipple 1.2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite; }
        .animate-radar-pulse-2 { animation: radarRipple 1.2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite; animation-delay: 0.4s; }
        
        .cute-bubble-particle {
          position: fixed;
          z-index: 99999;
          pointer-events: none;
          border-radius: 999px;
          border: 4px solid white;
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
          animation: bubbleGather 0.85s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        @keyframes bubbleGather {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; }
          40% { transform: translate(calc(var(--target-X) * 0.3), calc(var(--target-Y) * 0.2 - 30px)) scale(1.1); }
          100% { transform: translate(var(--target-X), var(--target-Y)) scale(0.3); opacity: 0; }
        }
        
        .pot-boing-feedback { animation: cuteBoing 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.5) both; }
        @keyframes cuteBoing {
          0% { transform: scale(1); }
          30% { transform: scale(1.15) rotate(-3deg); }
          60% { transform: scale(0.92) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  );
};

export default PantryPage;