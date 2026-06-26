import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux"; // Đọc ghi dữ liệu từ Redux Store
import { updateCampaignFormData, closeCampaignModal, createNewCampaign, updateCampaign } from "../store/slices/campaignsSlice"
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Tag,
  ShoppingBag,
  Search,
  ChevronDown,
} from "lucide-react";

// Rút gọn toàn bộ Props liên quan đến đóng mở và dữ liệu form, chỉ nhận mảng cứng để render list
const CampaignFormModal = ({
  categories = [],
  products = [],
}) => {
  const dispatch = useDispatch();

  // Móc nối trực tiếp với Redux Store để tự vận hành độc lập
  const { 
    isOpenModal: isOpen, 
    isEditing, 
    formData, 
    loading: isGlobalLoading 
  } = useSelector((state) => state.campaigns);

  // --- State tìm kiếm nội bộ ---
  const [categorySearch, setCategorySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  // --- State đóng mở Dropdown tùy chỉnh ---
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isProdDropdownOpen, setIsProdDropdownOpen] = useState(false);

  // --- Refs để xử lý click-outside ---
  const catRef = useRef(null);
  const prodRef = useRef(null);

  // Đổi hàm quản lý sự kiện gõ ký tự đẩy trực tiếp lên Redux Slice
  const onInputChange = (e) => {
    const name = e.target ? e.target.name : e.name;
    const value = e.target ? e.target.value : e.value;
    dispatch(updateCampaignFormData({ name, value }));
  };

  const onClose = () => {
    dispatch(closeCampaignModal());
  };

  // Tự xử lý Submit tích hợp tương ứng theo trạng thái Edit hay Create
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      dispatch(updateCampaign({ id: formData._id, campaignData: formData }));
    } else {
      dispatch(createNewCampaign(formData));
    }
  };

  // =========================================================================
  // TOÀN BỘ LOGIC TÍNH TOÁN DỮ LIỆU CŨ ĐƯỢC GIỮ NGUYÊN 100%
  // =========================================================================

  const selectedProductId = useMemo(() => {
    if (formData.product) {
      return typeof formData.product === "object"
        ? formData.product._id
        : formData.product;
    }
    if (formData.products && formData.products.length > 0) {
      return typeof formData.products[0] === "object"
        ? formData.products[0]._id
        : formData.products[0];
    }
    return "";
  }, [formData.product, formData.products]);

  const selectedCategoryId = useMemo(() => {
    return formData.category?._id || formData.category || "";
  }, [formData.category]);

  const selectedProductLabel = useMemo(() => {
    const found = products.find((p) => p._id === selectedProductId);
    if (!found) return "-- Choose a single product --";
    return `${found.name} ${found.stock !== undefined ? `(${found.stock > 0 ? `${found.stock} items` : "Out of stock"})` : ""}`;
  }, [products, selectedProductId]);

  const allCategoriesFlat = useMemo(() => {
    const flatList = [];
    categories.forEach((parent) => {
      flatList.push({
        ...parent,
        displayName: parent.name,
      });

      if (parent.subcategories && parent.subcategories.length > 0) {
        parent.subcategories.forEach((sub) => {
          flatList.push({
            ...sub,
            displayName: `— ${sub.name}`,
          });
        });
      }
    });
    return flatList;
  }, [categories]);

  const selectedCategoryLabel = useMemo(() => {
    const found = allCategoriesFlat.find((c) => c._id === selectedCategoryId);
    return found ? found.name : "-- Choose a category --";
  }, [allCategoriesFlat, selectedCategoryId]);

  const filteredCategories = useMemo(() => {
    return allCategoriesFlat.filter((cat) =>
      cat.displayName?.toLowerCase().includes(categorySearch.toLowerCase()),
    );
  }, [allCategoriesFlat, categorySearch]);

  const filteredProducts = useMemo(() => {
    return products.filter((prod) =>
      prod.name?.toLowerCase().includes(productSearch.toLowerCase()),
    );
  }, [products, productSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (catRef.current && !catRef.current.contains(event.target)) {
        setIsCatDropdownOpen(false);
      }
      if (prodRef.current && !prodRef.current.contains(event.target)) {
        setIsProdDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isCatDropdownOpen) setCategorySearch("");
  }, [isCatDropdownOpen]);

  useEffect(() => {
    if (!isProdDropdownOpen) setProductSearch("");
  }, [isProdDropdownOpen]);

  // Ngắt tiến trình render nếu trạng thái mở tắt đang đóng
  if (!isOpen) return null;

  // =========================================================================
  // TOÀN BỘ GIAO DIỆN JSX CŨ GIỮ NGUYÊN 100%
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-slate-100 p-6 sm:p-8 max-h-[90vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95 duration-200 text-slate-700 font-['Fredoka'] custom-scrollbar">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:bg-slate-50 transition-all cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
          <Sparkles
            size={18}
            className={isEditing ? "text-amber-500" : "text-[#77cd3af2]"}
          />
          <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
            {isEditing ? "Update Campaign Details" : "Create New Campaign"}
          </h3>
        </div>

        {/* Thay thế hàm nộp dữ liệu onSubmit tổng */}
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 mt-5">
          {/* Campaign Name */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-slate-600 text-xs sm:text-sm">
              Campaign Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={onInputChange}
              placeholder="e.g., Weekend Green Organic Rush"
              className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#77cd3a15] focus:border-[#77cd3af2] transition-all text-sm font-medium"
            />
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-600 text-xs sm:text-sm">
                Discount (%)
              </label>
              <input
                type="number"
                name="discountPercent"
                value={formData.discountPercent || ""}
                onChange={onInputChange}
                placeholder="e.g., 20"
                min="1"
                max="100"
                className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#77cd3a15] focus:border-[#77cd3af2] transition-all text-sm font-medium"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-600 text-xs sm:text-sm">
                Sale Limit (0 = ∞)
              </label>
              <input
                type="number"
                name="saleLimit"
                value={formData.saleLimit || ""}
                onChange={onInputChange}
                placeholder="e.g., 50"
                min="0"
                className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#77cd3a15] focus:border-[#77cd3af2] transition-all text-sm font-medium"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-600 text-xs sm:text-sm">
                Apply Scope By
              </label>
              <select
                name="targetType"
                value={
                  formData.targetType === "products" ||
                  formData.targetType === "product"
                    ? "product"
                    : "category"
                }
                onChange={onInputChange}
                className="p-3.5 rounded-2xl border border-slate-100 bg-white focus:outline-none focus:ring-4 focus:ring-[#77cd3a15] focus:border-[#77cd3af2] transition-all text-sm font-medium cursor-pointer shadow-sm text-slate-600"
              >
                <option value="category">Product Category</option>
                <option value="product">Specific Product</option>
              </select>
            </div>
          </div>

          {/* Smart Search Scope Selection: Category */}
          {(formData.targetType || "").toLowerCase() === "category" && (
            <div className="flex flex-col gap-1 relative" ref={catRef}>
              <label className="font-semibold text-slate-600 text-xs sm:text-sm">
                Select Target Category
              </label>

              <button
                type="button"
                onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-white text-sm font-medium cursor-pointer shadow-sm text-slate-600 text-left focus:outline-none focus:ring-4 focus:ring-[#77cd3a15] focus:border-[#77cd3af2] transition-all"
              >
                <div className="flex items-center gap-2 truncate">
                  <Tag size={16} className="text-blue-400 shrink-0" />
                  <span className="truncate">{selectedCategoryLabel}</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${isCatDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isCatDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute z-30 left-0 right-0 top-[102%] bg-white border border-slate-100 shadow-xl rounded-2xl p-2 flex flex-col gap-2 max-h-60"
                  >
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                      <Search size={14} className="text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search category..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full bg-transparent text-xs font-medium focus:outline-none"
                      />
                    </div>
                    <div className="overflow-y-auto flex flex-col gap-0.5 custom-scrollbar pr-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          onInputChange({
                            name: "category", value: ""
                          });
                          setIsCatDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-50 transition-colors cursor-pointer ${!selectedCategoryId ? "text-[#77cd3af2] bg-green-50/50 font-semibold" : "text-slate-500"}`}
                      >
                        -- Choose a category --
                      </button>
                      {filteredCategories.map((cat) => (
                        <button
                          key={cat._id}
                          type="button"
                          onClick={() => {
                            onInputChange({
                              name: "category", value: cat._id
                            });
                            setIsCatDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-50 transition-colors cursor-pointer ${selectedCategoryId === cat._id ? "text-[#77cd3af2] bg-green-50/50 font-semibold" : "text-slate-600"}`}
                        >
                          {cat.displayName}
                        </button>
                      ))}
                      {filteredCategories.length === 0 && (
                        <span className="text-center py-4 text-xs italic text-gray-400">
                          No categories found
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Smart Search Scope Selection: Product */}
          {((formData.targetType || "").toLowerCase() === "product" ||
            formData.targetType === "products") && (
            <div className="flex flex-col gap-1 relative" ref={prodRef}>
              <label className="font-semibold text-slate-600 text-xs sm:text-sm">
                Select Target Product
              </label>

              <button
                type="button"
                onClick={() => setIsProdDropdownOpen(!isProdDropdownOpen)}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-white text-sm font-medium cursor-pointer shadow-sm text-slate-600 text-left focus:outline-none focus:ring-4 focus:ring-[#77cd3a15] focus:border-[#77cd3af2] transition-all"
              >
                <div className="flex items-center gap-2 truncate">
                  <ShoppingBag size={16} className="text-purple-400 shrink-0" />
                  <span className="truncate">{selectedProductLabel}</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${isProdDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isProdDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute z-30 left-0 right-0 top-[102%] bg-white border border-slate-100 shadow-xl rounded-2xl p-2 flex flex-col gap-2 max-h-60"
                  >
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                      <Search size={14} className="text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products by name..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full bg-transparent text-xs font-medium focus:outline-none"
                      />
                    </div>
                    <div className="overflow-y-auto flex flex-col gap-0.5 custom-scrollbar pr-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          onInputChange({
                            name: "product", value: ""
                          });
                          setIsProdDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-50 transition-colors cursor-pointer ${!selectedProductId ? "text-[#77cd3af2] bg-green-50/50 font-semibold" : "text-slate-500"}`}
                      >
                        -- Choose a single product --
                      </button>
                      {filteredProducts.map((prod) => (
                        <button
                          key={prod._id}
                          type="button"
                          onClick={() => {
                            onInputChange({
                              name: "product", value: prod._id
                            });
                            setIsProdDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex justify-between items-center ${selectedProductId === prod._id ? "text-[#77cd3af2] bg-green-50/50 font-semibold" : "text-slate-600"}`}
                        >
                          <span className="truncate mr-2">{prod.name}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 ${prod.stock > 0 ? "bg-slate-100 text-slate-500" : "bg-rose-50 text-rose-400"}`}
                          >
                            {prod.stock !== undefined
                              ? prod.stock > 0
                                ? `${prod.stock} left`
                                : "Out of stock"
                              : ""}
                          </span>
                        </button>
                      ))}
                      {filteredProducts.length === 0 && (
                        <span className="text-center py-4 text-xs italic text-gray-400">
                          No products found
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Duration Config */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-600 text-xs sm:text-sm">
                Start Time (Auto-ON)
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime || ""}
                onChange={onInputChange}
                className="p-3.5 rounded-2xl border border-slate-100 bg-white focus:outline-none focus:ring-4 focus:ring-[#77cd3a15] focus:border-[#77cd3af2] transition-all text-sm font-medium text-slate-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-600 text-xs sm:text-sm">
                End Time (Auto-OFF)
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime || ""}
                onChange={onInputChange}
                className="p-3.5 rounded-2xl border border-slate-100 bg-white focus:outline-none focus:ring-4 focus:ring-[#77cd3a15] focus:border-[#77cd3af2] transition-all text-sm font-medium text-slate-600"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 text-slate-500 bg-slate-100 hover:bg-slate-200 p-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGlobalLoading}
              className={`w-full text-white p-3.5 rounded-2xl font-semibold text-sm transition-all text-center shadow-sm active:scale-95 cursor-pointer ${
                isGlobalLoading
                  ? "bg-slate-300 cursor-not-allowed"
                  : isEditing
                    ? "sm:flex-[2] bg-amber-500 hover:bg-amber-600 shadow-amber-100"
                    : "sm:flex-[2] bg-[#77cd3af2] hover:bg-[#6ab933] shadow-green-100"
              }`}
            >
              {isGlobalLoading
                ? "Processing..."
                : isEditing
                  ? "Save Modifications"
                  : "Schedule Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignFormModal;