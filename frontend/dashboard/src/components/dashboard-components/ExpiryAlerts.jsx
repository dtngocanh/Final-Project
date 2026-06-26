import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; 
import { fetchExpiringProducts } from "../../store/slices/productsSlice";
import { openModalWithProduct } from "../../store/slices/campaignsSlice"; 
import { AlertTriangle } from "lucide-react";

const ExpiryAlerts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  const { expiringItems } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(fetchExpiringProducts());
  }, [dispatch]);

  const getDaysLeft = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  return (
    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500" />
              Expiry Alerts 
            </h3>
            <p className="text-[11px] text-gray-400">Batches expiring within the next 1 month</p>
          </div>
          <span className="text-[10px] bg-rose-50 text-rose-600 font-black px-2.5 py-1 rounded-xl border border-rose-100">
            {expiringItems?.length || 0} Batches
          </span>
        </div>

        <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
          {expiringItems && expiringItems.length > 0 ? (
            expiringItems.map((log) => {
              const daysLeft = getDaysLeft(log.expiryDate);

              return (
                <div 
                  key={log._id} 
                  className="p-4 rounded-2xl bg-gray-50/60 border border-gray-100 flex flex-col gap-2 hover:border-amber-200 transition-all relative"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-gray-800 truncate">{log.product?.name || "Unknown Product"}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Batch: #{log._id?.slice(-6).toUpperCase()} | Qty: {log.quantityAdded}
                      </p>
                    </div>
                    
                    {/* Bố cục nút bấm và nhãn số ngày hiển thị cố định, rõ ràng */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {log.product && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dispatch(openModalWithProduct(log.product));
                            navigate("/campaigns"); // Tự chuyển trang sang /campaigns
                          }}
                          className="bg-[#77cd3af2] hover:bg-[#6ab933] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer shadow-sm active:scale-95 transition-transform"
                        >
                          Promo
                        </button>
                      )}
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${daysLeft <= 7 ? "bg-rose-100 text-rose-700 animate-pulse" : "bg-amber-100 text-amber-700"}`}>
                        {daysLeft <= 0 ? "Expired" : `${daysLeft}d left`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-[9px] text-gray-400 font-bold mt-1">
                    <span>Exp: {new Date(log.expiryDate).toLocaleDateString("en-US")}</span>
                    <span className="truncate max-w-[120px]">Supplier: {log.supplier}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-gray-400 italic text-xs">No products expiring in the next 30 days. Perfect!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpiryAlerts;