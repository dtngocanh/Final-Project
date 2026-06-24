import React from "react";
import { Sparkles, X, Tag, ShoppingBag } from "lucide-react";

const CampaignFormModal = ({
  isOpen,
  onClose,
  isEditing,
  formData,
  categories = [],
  products = [],
  isGlobalLoading,
  onInputChange,
  onSubmit,
}) => {
  if (!isOpen) return null;

  // =========================================================================
  // ĐỒNG BỘ DỮ LIỆU KHI EDIT:
  // Thẻ <select> chỉ hiểu ID dạng chuỗi (String), trong khi Mongoose trả về mảng products là các Object.
  // Đoạn logic dưới đây tự động trích xuất chuỗi ID sạch để gán cho thuộc tính `value` của select.
  // =========================================================================
  const selectedProductId = React.useMemo(() => {
    if (formData.product) {
      return typeof formData.product === "object" ? formData.product._id : formData.product;
    }
    if (formData.products && formData.products.length > 0) {
      return typeof formData.products[0] === "object" ? formData.products[0]._id : formData.products[0];
    }
    return "";
  }, [formData.product, formData.products]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-slate-100 p-6 sm:p-8 max-h-[90vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95 duration-200 text-slate-700 font-['Fredoka']">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:bg-slate-50 transition-all"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
          <Sparkles size={18} className={isEditing ? "text-amber-500" : "text-[#77cd3af2]"} />
          <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
            {isEditing ? "Update Campaign Details" : "Create New Campaign"}
          </h3>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-5">
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
                // Dự phòng trường hợp DB lưu chuỗi số nhiều "products", giao diện vẫn nhận diện đúng tab hiển thị là "product"
                value={(formData.targetType === "products" || formData.targetType === "product") ? "product" : "category"}
                onChange={onInputChange}
                className="p-3.5 rounded-2xl border border-slate-100 bg-white focus:outline-none focus:ring-4 focus:ring-[#77cd3a15] focus:border-[#77cd3af2] transition-all text-sm font-medium cursor-pointer shadow-sm text-slate-600"
              >
                <option value="category">Product Category</option>
                <option value="product">Specific Product</option>
              </select>
            </div>
          </div>

          {/* Conditional Scope Selection: Category */}
          {((formData.targetType || "").toLowerCase() === "category") && (
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-600 text-xs sm:text-sm">
                Select Target Category
              </label>
              <select
                name="category"
                value={formData.category?._id || formData.category || ""}
                onChange={onInputChange}
                className="p-3.5 rounded-2xl border border-slate-100 bg-white focus:outline-none focus:ring-4 focus:ring-[#77cd3a15] focus:border-[#77cd3af2] transition-all text-sm font-medium cursor-pointer shadow-sm text-slate-600"
              >
                <option value="">-- Choose a category --</option>
                {categories?.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Conditional Scope Selection: Product */}
          {((formData.targetType || "").toLowerCase() === "product" || formData.targetType === "products") && (
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-600 text-xs sm:text-sm">
                Select Target Product
              </label>
              <select
                name="product"
                value={selectedProductId} // Sử dụng ID chuỗi đã bóc tách thông minh ở trên để khớp với select option
                onChange={(e) => {
                  // Giả lập cấu trúc sự kiện chuẩn để hàm onInputChange ở file cha cập nhật đúng state formData.product
                  onInputChange({
                    target: { name: "product", value: e.target.value }
                  });
                }}
                className="p-3.5 rounded-2xl border border-slate-100 bg-white focus:outline-none focus:ring-4 focus:ring-[#77cd3a15] focus:border-[#77cd3af2] transition-all text-sm font-medium cursor-pointer shadow-sm text-slate-600"
              >
                <option value="">-- Choose a single product --</option>
                {products?.map((prod) => (
                  <option key={prod._id} value={prod._id}>
                    {prod.name} {prod.stock !== undefined ? `(${prod.stock > 0 ? `${prod.stock} items left` : "Out of stock"})` : ""}
                  </option>
                ))}
              </select>
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
              className="w-full sm:flex-1 text-slate-500 bg-slate-100 hover:bg-slate-200 p-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGlobalLoading}
              className={`w-full text-white p-3.5 rounded-2xl font-semibold text-sm transition-all text-center shadow-sm active:scale-95 ${
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