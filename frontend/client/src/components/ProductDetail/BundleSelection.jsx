import React, { useState, useEffect, useMemo } from "react";
import { Plus, Check, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { fetchFreqProducts } from "../../store/slices/productSlice";
import { toast } from "react-toastify";
import { addComboToCart } from "../../store/slices/cartSlice";
import FloatingDecor from "../Fruit/FloatingDecor";

const BundleSelection = ({ mainProduct }) => {
  const dispatch = useDispatch();
  const { freqProducts, isLoadingFreq } = useSelector((state) => state.product);
  const [selectedItems, setSelectedItems] = useState([]);

  const limitedFreqProducts = useMemo(() => {
    return freqProducts?.slice(0, 2) || [];
  }, [freqProducts]);

  useEffect(() => {
    if (mainProduct?._id) {
      dispatch(fetchFreqProducts(mainProduct._id));
    }
  }, [mainProduct?._id, dispatch]);

  useEffect(() => {
    if (limitedFreqProducts.length > 0) {
      const ids = limitedFreqProducts.map((item) => item.productId);
      setSelectedItems(ids);
    }
  }, [limitedFreqProducts]);

  const toggleItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const activeBundleItems = limitedFreqProducts.filter((item) =>
    selectedItems.includes(item.productId)
  );

  const originalTotalPrice =
    (mainProduct?.price || 0) +
    activeBundleItems.reduce((sum, item) => sum + (item.price || 0), 0);

  const isEligibleForDiscount =
    selectedItems.length === limitedFreqProducts.length &&
    limitedFreqProducts.length > 0;
  const discountPercentage = 10;

  const finalTotalPrice = isEligibleForDiscount
    ? originalTotalPrice * (1 - discountPercentage / 100)
    : originalTotalPrice;

  const savedAmount = originalTotalPrice - finalTotalPrice;

  const handleAddBundleToCart = async () => {
    const payload = {
      mainProductId: mainProduct._id,
      comboProductIds: selectedItems,
    };
    const resultAction = await dispatch(addComboToCart(payload));
    if (addComboToCart.fulfilled.match(resultAction)) {
      toast.success("Added combo successfully! ");
    } else {
      toast.error("Failed to add combo");
    }
  };

  if (isLoadingFreq || limitedFreqProducts.length === 0) return null;

  return (
  <section className="relative py-12 md:py-20 border-t border-neutral-200 dark:border-white/5 
  bg-gradient-to-b from-[#f4f4f5] via-[#f8f9fa] to-white 
  dark:from-[#09090b] dark:via-[#0c0c0e] dark:to-[#060606]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="mb-8 md:mb-12 text-center lg:text-left">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#77cd3a]">
            Perfect Match
          </span>
          <h3 className="text-2xl md:text-3xl font-extralight tracking-tighter text-gray-950 dark:text-white mt-2">
            Frequently <span className="font-medium text-[#77cd3a]">Bought Together</span>
          </h3>
        </div>

        <div className="flex flex-col xl:flex-row items-stretch gap-6 lg:gap-12">
          {/* Visualizer */}
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 flex-[1.5] bg-neutral-50/50 dark:bg-white/[0.01] rounded-[2rem] md:rounded-[2.5rem] py-6 md:py-8 px-4 border border-neutral-100 dark:border-white/5">
            <BundleItem
              image={mainProduct?.images?.[0]?.url || mainProduct?.image?.[0]}
              isMain
              name={mainProduct?.name}
            />
            {limitedFreqProducts.map((item) => (
              <React.Fragment key={item.productId}>
                <Plus size={16} className="text-neutral-300 dark:text-neutral-700 mx-1 md:mx-2 flex-shrink-0" />
                <BundleItem
                  image={item.image?.url || item.image}
                  isSelected={selectedItems.includes(item.productId)}
                  onClick={() => toggleItem(item.productId)}
                  name={item.name}
                />
              </React.Fragment>
            ))}
          </div>

          {/* Summary Panel */}
          <div className="w-full xl:w-[450px] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-neutral-50 dark:bg-white/[0.03] border border-neutral-100 dark:border-white/10 flex flex-col justify-between shadow-sm">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest">Bundle Summary</span>
                <span className="text-[11px] font-bold text-[#77cd3a] bg-[#77cd3a]/10 px-3 py-1 rounded-full uppercase">
                  {selectedItems.length + 1} Selected
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <SummaryRow name={mainProduct?.name} price={mainProduct?.price} />
                {activeBundleItems.map((item) => (
                  <SummaryRow key={item.productId} name={item.name} price={item.price} />
                ))}
              </div>

              <div className="pt-4 border-t border-dashed border-neutral-200 dark:border-white/10">
                {isEligibleForDiscount && (
                  <div className="flex justify-between text-xs text-red-500 font-medium mb-2">
                    <span>Combo Discount (10% Off)</span>
                    <span>-${savedAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-wider dark:text-white">Total Amount</span>
                  <div className="text-right">
                    {isEligibleForDiscount && <span className="text-sm text-neutral-400 line-through mr-2">${originalTotalPrice.toFixed(2)}</span>}
                    <span className="text-3xl font-light text-[#77cd3a]">${finalTotalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddBundleToCart}
              className="w-full mt-8 py-4 bg-black dark:bg-[#77cd3a] text-white dark:text-black rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl transition-all"
            >
              <ShoppingBag size={16} />
              <span className="uppercase tracking-[0.2em] text-[11px]">
                {isEligibleForDiscount ? "Add Full Combo & Save 10%" : "Add Selected to Bag"}
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Sub-components
const SummaryRow = ({ name, price }) => (
  <div className="flex justify-between text-[13px] dark:text-white">
    <span className="truncate opacity-60 w-3/4 italic">1x {name}</span>
    <span className="font-semibold">${(price || 0).toFixed(2)}</span>
  </div>
);

const BundleItem = ({ image, isMain = false, isSelected = true, onClick, name }) => (
  <div className="flex flex-col items-center gap-2 md:gap-4">
    <motion.div
      onClick={onClick}
      className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center cursor-pointer transition-all duration-300 border-2 ${
        isSelected ? "bg-white dark:bg-neutral-900 shadow-xl border-white dark:border-white/10" : "opacity-40 grayscale scale-90 border-dashed border-neutral-300 dark:border-neutral-700"
      }`}
    >
      <img src={image} alt={name} className="w-[60%] h-[60%] object-contain" />
      {!isMain && (
        <div className={`absolute -top-1 -right-1 w-5 h-5 md:w-7 md:h-7 rounded-full flex items-center justify-center border-2 border-white dark:border-[#060606] ${isSelected ? "bg-[#77cd3a]" : "bg-neutral-300 scale-0"}`}>
          <Check size={10} strokeWidth={4} className="text-white" />
        </div>
      )}
    </motion.div>
    <span className="text-[8px] md:text-[9px] uppercase font-bold tracking-tight text-center max-w-[60px] md:max-w-[80px] truncate">
      {name?.split(" ").slice(0, 2).join(" ")}
    </span>
  </div>
);

export default BundleSelection;