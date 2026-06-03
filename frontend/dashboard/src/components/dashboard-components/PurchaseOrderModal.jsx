import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { replenishProductStock } from '../../store/slices/productsSlice';

const PurchaseOrderModal = ({ isOpen, onClose, products }) => {
  const dispatch = useDispatch();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [replenishQty, setReplenishQty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null; // Nếu không mở thì không render gì cả

  const handleReplenishSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductId || !replenishQty || replenishQty <= 0) {
      toast.error("Please select a product and enter a valid quantity!");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(replenishProductStock({ 
        productId: selectedProductId, 
        quantity: Number(replenishQty) 
      })).unwrap();
      
      toast.success("Stock updated successfully!");
      // Reset form & đóng modal
      setSelectedProductId('');
      setReplenishQty('');
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
        <p className="text-xs text-gray-400 mb-6">Replenish stock for your Veganic catalog items.</p>
        
        <form onSubmit={handleReplenishSubmit} className="space-y-5">
          {/* Ô chọn Sản phẩm */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Select Product</label>
            <select 
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full p-4 text-sm bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#77cd3af2] font-medium text-gray-700 transition-all"
            >
              <option value="">-- Choose an item --</option>
              {products?.map((prod) => (
                <option key={prod._id} value={prod._id}>
                  {prod.name} (Current: {prod.stock})
                </option>
              ))}
            </select>
          </div>

          {/* Ô điền Số lượng */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Quantity to Add</label>
            <input 
              type="number"
              min="1"
              placeholder="e.g. 50"
              value={replenishQty}
              onChange={(e) => setReplenishQty(e.target.value)}
              className="w-full p-4 text-sm bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#77cd3af2] font-bold text-gray-800 transition-all"
            />
          </div>

          {/* Nhóm Nút Bấm */}
          <div className="flex items-center gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="w-1/2 py-4 bg-gray-100 text-gray-500 text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 py-4 bg-[#77cd3af2] text-white text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-[#63b12f] shadow-lg shadow-green-100 disabled:opacity-50 transition-all"
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