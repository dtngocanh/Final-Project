import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  replenishProductStock,
  restockProductLogs,
} from "../../store/slices/productsSlice";

const PurchaseOrderModal = ({ isOpen, onClose, products }) => {
  const dispatch = useDispatch();
  const [selectedProductId, setSelectedProductId] = useState("");
  const [replenishQty, setReplenishQty] = useState("");
  const [manufactureDate, setManufactureDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [costPrice, setCostPrice] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // 1. Lọc sản phẩm theo từ khóa gõ vào (Không phân biệt hoa thường)
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products || [];
    return (
      products?.filter((prod) =>
        prod.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      ) || []
    );
  }, [searchTerm, products]);

  // 2. Tìm tên sản phẩm hiện tại đang được chọn để hiển thị lên ô input
  const selectedProduct = products?.find((p) => p._id === selectedProductId);

  // 3. Đóng dropdown khi click ra ngoài vùng tìm kiếm
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleReplenishSubmit = async (e) => {
    e.preventDefault();

    if (
      !selectedProductId ||
      !replenishQty ||
      replenishQty <= 0 ||
      costPrice <= 0 ||
      !manufactureDate ||
      !expiryDate
    ) {
      toast.error("Please fill in all fields correctly!");
      return;
    }

    if (new Date(expiryDate) <= new Date(manufactureDate)) {
      toast.error("Expiry date must be later than manufacture date!");
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(
        replenishProductStock({
          productId: selectedProductId,
          quantity: Number(replenishQty),
          costPrice: Number(costPrice),
          manufactureDate,
          expiryDate,
        }),
      ).unwrap();

      toast.success("Stock replenished successfully with batch tracking!");

      // Reset form
      setSelectedProductId("");
      setReplenishQty("");
      setManufactureDate("");
      setCostPrice("");
      setExpiryDate("");
      onClose();
    } catch (err) {
      toast.error(err || "Failed to update stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-[35px] p-8 border border-gray-100 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Purchase Order</h3>
        <p className="text-xs text-gray-400 mb-6">
          Replenish stock for your Veggies catalog items.
        </p>

        <form onSubmit={handleReplenishSubmit} className="space-y-5">
          {/* Select Product */}

          <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
              Select Product
            </label>

            {/* Ô Input để gõ tìm kiếm */}
            <div className="relative">
              <input
                type="text"
                placeholder={
                  selectedProduct
                    ? `${selectedProduct.name} (Selected)`
                    : "-- Type to search product --"
                }
                value={searchTerm}
                onFocus={() => setIsOpenDropdown(true)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsOpenDropdown(true);
                }}
                className="w-full p-4 text-sm bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#77cd3af2] pr-10"
              />
              {/* Nút xóa nhanh từ khóa tìm kiếm */}
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Danh sách kết quả tìm kiếm thả xuống */}
            {isOpenDropdown && (
              <div className="absolute top-[100%] left-0 w-full bg-white border border-gray-100 rounded-2xl mt-1 shadow-xl max-h-60 overflow-y-auto z-50 divide-y divide-gray-50 custom-scrollbar">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((prod) => (
                    <div
                      key={prod._id}
                      onClick={() => {
                        setSelectedProductId(prod._id); // Lưu ID vào state cũ của bạn
                        setSearchTerm(""); // Xóa chữ trong ô tìm kiếm sau khi chọn xong
                        setIsOpenDropdown(false); // Đóng danh sách lại
                      }}
                      className={`p-3.5 text-sm cursor-pointer transition-colors flex justify-between items-center ${
                        selectedProductId === prod._id
                          ? "bg-emerald-50 text-[#77cd3af2] font-bold"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className="truncate mr-2">{prod.name}</span>
                      <span
                        className={`text-[11px] shrink-0 font-medium px-2 py-0.5 rounded-lg ${
                          prod.stock === 0
                            ? "bg-rose-50 text-rose-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        Stock: {prod.stock}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-400 italic">
                    No products match "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Quantity */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
                Quantity to Add
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 50"
                value={replenishQty}
                onChange={(e) => setReplenishQty(e.target.value)}
                className="w-full p-4 text-sm bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#77cd3af2]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
                Cost Price ($)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 15000"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full p-4 text-sm bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#77cd3af2]"
              />
            </div>
          </div>
          {/* Manufacture Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
              Manufacture Date
            </label>
            <input
              type="date"
              value={manufactureDate}
              onChange={(e) => setManufactureDate(e.target.value)}
              className="w-full p-4 text-sm bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#77cd3af2]"
            />
          </div>

          {/* Expiry Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
              Expiry Date
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full p-4 text-sm bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#77cd3af2]"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-4 bg-gray-100 text-gray-500 text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-gray-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 py-4 bg-[#77cd3af2] text-white text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-[#63b12f] disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : "Confirm Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseOrderModal;
