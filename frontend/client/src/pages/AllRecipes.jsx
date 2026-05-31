import React, { useState, useEffect } from "react";
import { Search, Utensils, Award, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const AllRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Các danh mục để gộp thành ~100 món ăn (Thịt, cá, rau củ quả)
  const categories = ["Beef", "Chicken", "Pork", "Seafood", "Vegetarian", "Vegan"];

  useEffect(() => {
    const fetchAllRecipes = async () => {
      setLoading(true);
      try {
        // Gọi API của tất cả danh mục cùng một lúc để lấy lượng data lớn
        const promises = categories.map((cat) =>
          fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat}`)
            .then((res) => res.json())
            .then((data) => {
              // Gắn thêm tag category vào từng item để tiện lọc sau này
              return data.meals
                ? data.meals.map((meal) => ({ ...meal, category: cat }))
                : [];
            }),
        );

        const results = await Promise.all(promises);
        // Gộp tất cả các mảng lại thành một danh sách duy nhất (~100-120 món)
        const combinedRecipes = results.flat();

        // Trộn ngẫu nhiên danh sách để hiển thị sinh động hơn
        const shuffled = combinedRecipes.sort(() => 0.5 - Math.random());

        setRecipes(shuffled);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllRecipes();
  }, []);

  // Bộ lọc tìm kiếm theo tên và theo danh mục (Category)
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.strMeal
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-6 md:p-12 transition-colors duration-300">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="uppercase tracking-[0.3em] text-[11px] font-bold text-[#77cd3af2]">
            Chasing Flavors
          </span>
          <h1 className="text-4xl md:text-5xl font-light mt-2 tracking-tight">
            All <span className="text-black dark:text-white">Recipes</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2 font-light">
            Discover over {recipes.length} fresh & healthy culinary
            inspirations.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md focus:outline-none focus:ring-1 focus:ring-[#77cd3af2] focus:border-[#77cd3af2] transition-all text-sm"
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* TABS PHÂN LOẠI (CATEGORIES) */}
      <div className="max-w-7xl mx-auto mb-8 overflow-x-auto no-scrollbar flex items-center gap-2 pb-2">
        {["All", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-medium tracking-wide border transition-all duration-300 whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-sm"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800 dark:hover:border-gray-600"
            }`}
          >
            {cat === "All" ? "All Ingredients" : cat}
          </button>
        ))}
      </div>

      {/* GRID HIỂN THỊ MÓN ĂN */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          // SKELTON LOADING EFFECT
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="bg-gray-200 dark:bg-gray-800 aspect-[4/5] rounded-3xl" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.idMeal}
                className="group relative bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-900 shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 flex flex-col"
              >
                {/* ẢNH MÓN ĂN VỚI HIỆU ỨNG HOVER */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <Link
                    to={`/recipe/${recipe.idMeal}`}
                    className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-800 block"
                  >
                    <img
                      src={recipe.strMealThumb}
                      alt={recipe.strMeal}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </Link>

                  {/* Tag góc trên */}
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-white/80 dark:bg-gray-900/80 backdrop-blur-md text-gray-600 dark:text-gray-300 shadow-sm">
                    {recipe.category}
                  </span>
                </div>

                {/* THÔNG TIN CHI TIẾT */}

                <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-[#77cd3af2] transition-colors duration-300">
                      {recipe.strMeal}
                    </h3>
                  </div>

                  {/* Metadata Giả lập cho đẹp giao diện */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800/50 text-[11px] text-gray-400 font-light">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>25-40 mins</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#77cd3af2]">
                      <Award size={12} />
                      <span>Easy Prep</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* TRẠNG THÁI KHÔNG TÌM THẤY KẾT QUẢ */
          <div className="text-center py-20">
            <Utensils
              size={40}
              className="mx-auto text-gray-300 dark:text-gray-700 mb-4 animate-bounce"
            />
            <p className="text-gray-500 dark:text-gray-400 font-light">
              No recipes match your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllRecipes;
