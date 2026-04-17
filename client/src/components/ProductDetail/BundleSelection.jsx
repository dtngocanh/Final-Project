import React, { useState } from "react";
import { Plus, Check, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const MOCK_BUNDLE = [
  { id: 2, name: "Organic Salad Dressing", price: 5.5, image: "/cheri2.png" },
  { id: 3, name: "Wooden Salad Bowl", price: 12.0, image: "/apple.png" },
];

const BundleSection = ({ mainProduct = { name: "Baby Spinach", price: 4.5, image: "/honey.png" } }) => {
  const [selectedItems, setSelectedItems] = useState(MOCK_BUNDLE.map(item => item.id));

  const toggleItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const totalPrice = mainProduct.price + MOCK_BUNDLE
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);

  return (
    <section className="py-12 md:py-20 border-t border-neutral-100 dark:border-white/5 bg-white dark:bg-[#020202]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        
        {/* Header - Căn giữa trên mobile */}
        <div className="mb-10 text-center lg:text-left">
          <h3 className="text-xl md:text-2xl font-extralight tracking-tighter text-gray-950 dark:text-white">
            Frequently <span className="font-medium text-[#77cd3a]">Bought Together</span>
          </h3>
          <p className="text-[10px] md:text-xs text-neutral-400 mt-2 uppercase tracking-[0.2em]">Upgrade your experience</p>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10 lg:gap-16">
          
          {/* Bundle Visualizer - Chuyển sang Grid trên mobile nhỏ */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-6 lg:flex-grow">
            
            {/* Main Product */}
            <BundleItem image={mainProduct.image} isMain />
            
            {/* List sản phẩm đi kèm */}
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
              {MOCK_BUNDLE.map((item) => (
                <React.Fragment key={item.id}>
                  {/* Icon cộng: Xoay dọc trên mobile, ngang trên tablet/desktop */}
                  <div className="flex items-center justify-center">
                    <Plus size={20} className="text-neutral-300 rotate-0 sm:rotate-0" />
                  </div>
                  
                  <BundleItem 
                    image={item.image} 
                    isSelected={selectedItems.includes(item.id)}
                    onClick={() => toggleItem(item.id)}
                    name={item.name} // Hiện tên dưới ảnh trên mobile nếu cần
                  />
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Price & Action Card - Tự thích nghi chiều rộng */}
          <div className="w-full lg:max-w-[380px] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-neutral-50 dark:bg-white/[0.02] border border-neutral-100 dark:border-white/5 shadow-sm">
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center border-b border-neutral-200 dark:border-white/5 pb-4">
                <span className="text-sm text-neutral-500 font-medium">Selected Bundle</span>
                <span className="px-3 py-1 bg-[#77cd3a]/10 text-[#77cd3a] rounded-full text-xs font-bold">
                  {selectedItems.length + 1} Items
                </span>
              </div>
              
              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="truncate w-2/3 text-neutral-600 dark:text-neutral-400">{mainProduct.name}</span>
                  <span className="font-medium">${mainProduct.price.toFixed(2)}</span>
                </div>
                {MOCK_BUNDLE.filter(i => selectedItems.includes(i.id)).map(item => (
                  <div key={item.id} className="flex justify-between text-xs md:text-sm animate-in fade-in slide-in-from-bottom-2">
                    <span className="truncate w-2/3 text-neutral-600 dark:text-neutral-400">{item.name}</span>
                    <span className="font-medium">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-dashed border-neutral-300 dark:border-white/10 flex justify-between items-center">
                <span className="text-sm font-bold uppercase tracking-wider">Total</span>
                <span className="text-2xl md:text-3xl font-light tracking-tighter text-[#77cd3a]">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <button className="w-full py-4 md:py-5 bg-gray-950 dark:bg-white text-white dark:text-black rounded-full font-bold text-sm flex items-center justify-center gap-3 hover:bg-[#77cd3a] dark:hover:bg-[#77cd3a] dark:hover:text-white transition-all duration-500 group active:scale-95">
              <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
              Add Bundle to Cart
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

const BundleItem = ({ image, isMain = false, isSelected = true, onClick, name }) => (
  <div className="flex flex-col items-center gap-3">
    <motion.div 
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative w-28 h-28 md:w-36 md:h-36 rounded-[2rem] flex items-center justify-center cursor-pointer transition-all duration-500 border ${
        isSelected 
          ? "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-white/10 shadow-xl shadow-black/5" 
          : "bg-transparent border-dashed border-neutral-300 dark:border-white/5 opacity-40 scale-90"
      }`}
    >
      <img src={image} alt="bundle item" className="w-[70%] h-[70%] object-contain" />
      
      {!isMain && (
        <div className={`absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white dark:border-[#020202] transition-all ${
          isSelected ? "bg-[#77cd3a] text-white scale-100" : "bg-neutral-200 text-transparent scale-75"
        }`}>
          <Check size={12} strokeWidth={4} />
        </div>
      )}
      
      {isMain && (
        <span className="absolute -bottom-2 px-3 py-1 bg-neutral-950 dark:bg-[#77cd3a] text-white text-[7px] font-black uppercase tracking-[0.15em] rounded-full shadow-lg">
          Current
        </span>
      )}
    </motion.div>
    
    {/* Tên sản phẩm nhỏ dưới ảnh (chỉ hiện trên mobile để dễ nhận biết) */}
    {name && <span className="text-[10px] text-neutral-400 font-medium sm:hidden truncate max-w-[100px]">{name}</span>}
  </div>
);

export default BundleSection;