import React from 'react';
import { 
  X, MapPin, Phone, User, Package, Mail, ShoppingBasket, 
  Salad, Citrus, Cherry, Leaf, Carrot, Truck, CheckCircle, Clock, XCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../store/slices/orderSlice";
import { toast } from "react-toastify";

const OrderDetailsModal = ({ order, onClose }) => {
  const dispatch = useDispatch();
  
  if (!order) return null;

  // Hàm xử lý cập nhật trạng thái
  const handleStatusUpdate = (newStatus) => {
    if (order.orderStatus === "Delivered") {
        toast.info("Order is already delivered!");
        return;
    }
    dispatch(updateOrderStatus({ id: order._id, status: newStatus }));
    toast.success(`Order status updated to: ${newStatus}`);
  };

  const decoVeggie = [
    { Icon: Carrot, size: 80, top: '5%', left: '-2%', delay: 0, rotate: 15, duration: 4 },
    { Icon: Salad, size: 110, top: '60%', left: '-5%', delay: 2, rotate: -20, duration: 5 },
    { Icon: Citrus, size: 70, top: '10%', right: '2%', delay: 1, rotate: 45, duration: 3.5 },
    { Icon: Cherry, size: 60, bottom: '15%', right: '5%', delay: 3, rotate: -10, duration: 4.5 },
    { Icon: Leaf, size: 90, top: '35%', right: '-8%', delay: 1.5, rotate: 10, duration: 6 },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white/95 w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative font-['Fredoka'] border border-white/20">
        
        {/* --- DECOR RAU CỦ BAY --- */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {decoVeggie.map((veg, i) => (
            <motion.div
              key={i}
              className="absolute text-[#77cd3af2] opacity-[0.12] z-0"
              style={{ top: veg.top, left: veg.left, right: veg.right, bottom: veg.bottom }}
              animate={{ y: [0, -25, 0], rotate: [veg.rotate, veg.rotate + 10, veg.rotate - 10, veg.rotate] }}
              transition={{ duration: veg.duration, repeat: Infinity, delay: veg.delay, ease: "easeInOut" }}
            >
              <veg.Icon size={veg.size} strokeWidth={1.5} />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="bg-[#77cd3af2]/90 backdrop-blur-md p-8 text-white flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingBasket size={24} />
                <h2 className="text-2xl font-bold tracking-tight">Manage Order</h2>
              </div>
              <p className="text-white/80 text-[10px] tracking-widest uppercase mt-1 italic font-medium">
                Ref: {order._id?.toUpperCase()}
              </p>
            </div>
            <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/40 transition-all hover:rotate-90">
              <X size={20} />
            </button>
          </div>

          <div className="p-8 max-h-[65vh] overflow-y-auto custom-scrollbar relative">
            
            {/* 1. PROGRESS CONTROL (MỚI) */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-[#77cd3af2] uppercase text-[10px] font-black tracking-widest mb-4">
                <Clock size={14} /> Step-by-Step Status
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Processing", color: "orange", icon: Clock },
                  { label: "Shipped", color: "blue", icon: Truck },
                  { label: "Delivered", color: "green", icon: CheckCircle },
                  { label: "Canceled", color: "red", icon: XCircle },
                ].map((step) => {
                  const isActive = order.orderStatus === step.label;
                  const colorMap = {
                    orange: "text-orange-500 bg-orange-50 border-orange-200",
                    blue: "text-blue-500 bg-blue-50 border-blue-200",
                    green: "text-green-500 bg-green-50 border-green-200",
                    red: "text-red-500 bg-red-50 border-red-200"
                  };
                  return (
                    <button
                      key={step.label}
                      onClick={() => handleStatusUpdate(step.label)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-[24px] transition-all border-2 
                        ${isActive ? colorMap[step.color] : "bg-white border-gray-50 text-gray-300 hover:border-gray-200"}`}
                    >
                      <step.icon size={22} strokeWidth={isActive ? 3 : 1.5} />
                      <span className="text-[10px] font-bold">{step.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. CUSTOMER & SHIPPING INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-3 bg-white/60 p-5 rounded-[30px] border border-gray-100 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 text-[#77cd3af2] uppercase text-[10px] font-black tracking-widest">
                  <User size={14} /> Customer Information
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-lg leading-tight">{order.shippingInfo?.fullName || order.shippingInfo?.name}</p>
                  <p className="flex items-center gap-2 text-gray-400 text-xs italic mt-1">
                    <Mail size={12} /> {order.user?.email || "No Email Provided"}
                  </p>
                  <p className="flex items-center gap-2 text-gray-500 text-sm mt-1 font-medium">
                    <Phone size={12} /> {order.shippingInfo?.phone}
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-white/60 p-5 rounded-[30px] border border-gray-100 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 text-[#77cd3af2] uppercase text-[10px] font-black tracking-widest">
                  <MapPin size={14} /> Delivery Address
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic font-medium">
                  {order.shippingInfo?.address}, {order.shippingInfo?.city}, {order.shippingInfo?.country}
                </p>
              </div>
            </div>

            {/* 3. PRODUCT LIST */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#77cd3af2] uppercase text-[10px] font-black tracking-widest">
                <Package size={14} /> Items Ordered ({order.orderItems?.length})
              </div>
              <div className="space-y-3">
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white/80 p-3 rounded-[24px] shadow-sm border border-gray-50 group hover:border-[#77cd3af2] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={item.image || (item.product?.images?.[0]?.url) || "https://cdn-icons-png.flaticon.com/512/2329/2329865.png"} 
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-2xl shadow-sm bg-gray-50 group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#77cd3af2] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm font-['Fredoka']">
                          {item.quantity}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-700 block text-base leading-tight">{item.name}</span>
                        <span className="text-[10px] text-gray-400 font-bold tracking-tighter uppercase font-['Fredoka']">Price: ${item.price?.toFixed(2)} / unit</span>
                      </div>
                    </div>
                    <span className="font-black text-[#77cd3af2] text-xl tracking-tight">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="p-8 bg-white/90 backdrop-blur-md border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 font-['Fredoka']">
            <div className="text-center md:text-left">
              <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Grand Total</span>
              <p className="text-4xl font-black text-[#77cd3af2] leading-none tracking-tight">${order.totalPrice?.toFixed(2)}</p>
            </div>
            
            {order.orderStatus === "Delivered" ? (
              <div className="px-10 py-4 bg-green-500 text-white rounded-[22px] font-bold text-sm flex items-center gap-2 shadow-lg shadow-green-100">
                <CheckCircle size={18} /> Order Completed
              </div>
            ) : (
              <button 
                onClick={onClose} 
                className="w-full md:w-auto px-12 py-4 bg-gray-900 text-white rounded-[22px] font-bold text-sm hover:bg-[#77cd3af2] transition-all shadow-xl active:scale-95"
              >
                Close Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;