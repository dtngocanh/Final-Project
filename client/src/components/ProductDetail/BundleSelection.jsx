import React, { useState, useEffect } from "react";
import { Plus, Check, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { fetchFreqProducts } from "../../store/slices/productSlice";
import { useCartActions } from "../../hooks/useCartActions";
import { toast } from "react-toastify";

const BundleSelection = ({ mainProduct }) => {
  const dispatch = useDispatch();
  const { handleCartAction } = useCartActions();
  
  const { freqProducts, isLoadingFreq } = useSelector((state) => state.product);
  const [selectedItems, setSelectedItems] = useState([]);

  const limitedFreqProducts = React.useMemo(() => {
    return freqProducts?.slice(0, 2) || [];
  }, [freqProducts]);

  useEffect(() => {
    if (mainProduct?._id) {
      dispatch(fetchFreqProducts(mainProduct._id));
    }
  }, [mainProduct?._id, dispatch]);

  useEffect(() => {
    if (limitedFreqProducts.length > 0) {
      const ids = limitedFreqProducts.map(item => item.productId);
      setSelectedItems(ids);
    }
  }, [limitedFreqProducts]);

  const toggleItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const activeBundleItems = limitedFreqProducts.filter(item => selectedItems.includes(item.productId));
  const totalPrice = (mainProduct?.price || 0) + activeBundleItems.reduce((sum, item) => sum + (item.price || 0), 0);

  const handleAddBundleToCart = async () => {
    try {
      await handleCartAction(mainProduct, "ADD", 1);
      for (const item of activeBundleItems) {
        const formattedItem = {
          _id: item.productId,
          name: item.name,
          price: item.price,
          images: item.image?.url ? [item.image] : (Array.isArray(item.image) ? item.image : []),
          stock: item.stock, 
        };
        await handleCartAction(formattedItem, "ADD", 1);
      }
      // toast.success("Added full combo to your bag! 🛒");
    } catch (error) {
      console.error("Bundle Add Error:", error);
      toast.error("Something went wrong!");
    }
  };

  if (isLoadingFreq || limitedFreqProducts.length === 0) return null;

  return (
    <section className="py-16 md:py-20 border-t border-neutral-100 dark:border-white/5 bg-white dark:bg-[#060606]">
      <div className="max-w-[1200px] mx-auto px-6">
        
        <div className="mb-10 text-center lg:text-left ml-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#77cd3a]">Perfect Match</span>
          <h3 className="text-xl md:text-3xl font-extralight tracking-tighter text-gray-950 dark:text-white mt-2">
            Frequently <span className="font-medium text-[#77cd3a]">Bought Together</span>
          </h3>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12">
          
          {/* Left: Product Visualizer - Thu nhỏ lại xíu */}
          <div className="flex items-center justify-center gap-3 md:gap-6 flex-[1.5] bg-neutral-50/50 dark:bg-white/[0.01] rounded-[2.5rem] py-8 px-4 border border-neutral-100 dark:border-white/5">
            <BundleItem 
              image={mainProduct?.images?.[0]?.url || mainProduct?.image?.[0]} 
              isMain 
              name={mainProduct?.name} 
            />
            
            {limitedFreqProducts.map((item) => (
              <React.Fragment key={item.productId}>
                <Plus size={18} className="text-neutral-300 stroke-[1.5px] flex-shrink-0" />
                <BundleItem 
                  image={item.image?.url || item.image} 
                  isSelected={selectedItems.includes(item.productId)}
                  onClick={() => toggleItem(item.productId)}
                  name={item.name}
                />
              </React.Fragment>
            ))}
          </div>

          {/* Right: Summary & Action - Tăng chiều rộng lên (flex-1 hoặc w-[450px]) */}
          <div className="w-full lg:w-[450px] p-8 rounded-[2.5rem] bg-neutral-50 dark:bg-white/[0.03] border border-neutral-100 dark:border-white/10 flex flex-col justify-between shadow-sm">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest">Bundle Summary</span>
                <span className="text-[11px] font-bold text-[#77cd3a] bg-[#77cd3a]/10 px-3 py-1 rounded-full uppercase">
                  {selectedItems.length + 1} Selected
                </span>
              </div>
              
              <div className="space-y-4 pt-4">
                <div className="flex justify-between text-[13px] dark:text-white group">
                  <span className="truncate opacity-60 w-3/4 group-hover:opacity-100 transition-opacity italic">1x {mainProduct?.name}</span>
                  <span className="font-semibold">${mainProduct?.price?.toFixed(2)}</span>
                </div>
                
                {activeBundleItems.map(item => (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }}
                    key={item.productId} 
                    className="flex justify-between text-[13px] dark:text-white group"
                  >
                    <span className="truncate opacity-60 w-3/4 group-hover:opacity-100 transition-opacity italic">1x {item.name}</span>
                    <span className="font-semibold">${(item.price || 0).toFixed(2)}</span>
                  </motion.div>
                ))}
              </div>

              <div className="pt-6 border-t border-dashed border-neutral-200 dark:border-white/10 flex justify-between items-center">
                <span className="text-xs font-black uppercase dark:text-white tracking-wider">Total Amount</span>
                <span className="text-4xl font-light text-[#77cd3a] tracking-tighter">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddBundleToCart}
              className="w-full mt-8 py-5 bg-black dark:bg-[#77cd3a] text-white dark:text-black rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl hover:shadow-[#77cd3a]/20 transition-all"
            >
              <ShoppingBag size={18} />
              <span className="uppercase tracking-[0.2em] text-[11px]">Add Full Combo to Bag</span>
            </motion.button>
          </div>

        </div>
      </div>
    </section>
  );
};

const BundleItem = ({ image, isMain = false, isSelected = true, onClick, name }) => (
  <div className="flex flex-col items-center gap-4">
    <motion.div 
      whileHover={isSelected ? { y: -5 } : {}}
      onClick={onClick}
      className={`relative w-20 h-20 md:w-28 md:h-28 rounded-[2rem] flex items-center justify-center cursor-pointer transition-all duration-500 border-2 ${
        isSelected 
          ? "bg-white dark:bg-neutral-900 shadow-xl border-white dark:border-white/10" 
          : "opacity-25 grayscale scale-90 border-dashed border-neutral-300 dark:border-white/5"
      }`}
    >
      <img src={image} alt={name} className="w-[65%] h-[65%] object-contain" />
      
      {!isMain && (
        <div className={`absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-[3px] border-white dark:border-[#060606] transition-all duration-500 ${
          isSelected ? "bg-[#77cd3a] text-white scale-100" : "bg-neutral-300 scale-0"
        }`}>
          <Check size={12} strokeWidth={4} />
        </div>
      )}
      
      {isMain && (
        <div className="absolute -bottom-2 px-2 py-0.5 bg-black text-white text-[7px] font-black uppercase rounded-full tracking-tighter shadow-md">
          Current
        </div>
      )}
    </motion.div>
    <span className={`text-[9px] uppercase font-bold tracking-tight text-center max-w-[80px] leading-tight transition-colors ${isSelected ? "text-neutral-500" : "text-neutral-300"}`}>
      {name?.split(' ').slice(0, 2).join(' ')}
    </span>
  </div>
);

export default BundleSelection;