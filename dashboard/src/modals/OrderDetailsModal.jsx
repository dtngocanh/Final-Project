import React from "react";
import {
  X,
  MapPin,
  Phone,
  User,
  ShoppingBasket,
  Salad,
  Citrus,
  Cherry,
  Carrot,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { updateOrderStatus } from "../store/slices/orderSlice";
import { toast } from "react-toastify";

const OrderDetailsModal = ({ order, onClose }) => {
  const dispatch = useDispatch();

  // Select the latest order data from Store to ensure UI sync
  const currentOrder =
    useSelector((state) =>
      state.order.orders.find((o) => o._id === order?._id),
    ) || order;

  if (!currentOrder) return null;

  const orderStatuses = ["Processing", "Shipped", "Delivered", "Canceled"];
  const currentIndex = orderStatuses.indexOf(currentOrder.orderStatus);

  const handleStatusUpdate = async (newStatus) => {
    if (!currentOrder?._id) {
      toast.error("Order ID not found!");
      return;
    }

    // Logic guard: Prevent updating if already Delivered (unless canceling)
    if (currentOrder.orderStatus === "Delivered" && newStatus !== "Canceled")
      return;

    try {
      await dispatch(
        updateOrderStatus({ id: currentOrder._id, status: newStatus }),
      ).unwrap();
      toast.success(`Successfully updated to ${newStatus}`);
    } catch (err) {
      toast.error(err || "Update failed");
    }
  };

  const getNextAction = () => {
    if (currentOrder.orderStatus === "Processing")
      return {
        label: "Mark as Shipped",
        status: "Shipped",
        icon: Truck,
        color: "bg-blue-500",
      };
    if (currentOrder.orderStatus === "Shipped")
      return {
        label: "Mark as Delivered",
        status: "Delivered",
        icon: CheckCircle,
        color: "bg-green-500",
      };
    return null;
  };

  const nextAction = getNextAction();

  const decoVeggie = [
    { Icon: Carrot, size: 80, top: "5%", left: "-2%", rotate: 15, duration: 4 },
    {
      Icon: Salad,
      size: 110,
      top: "60%",
      left: "-5%",
      rotate: -20,
      duration: 5,
    },
    {
      Icon: Citrus,
      size: 70,
      top: "10%",
      right: "2%",
      rotate: 45,
      duration: 3.5,
    },
    {
      Icon: Cherry,
      size: 60,
      bottom: "15%",
      right: "5%",
      rotate: -10,
      duration: 4.5,
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden relative font-['Fredoka']">
        {/* Decorative Background Icons */}
        <div className="absolute inset-0 pointer-events-none">
          {decoVeggie.map((veg, i) => (
            <motion.div
              key={i}
              className="absolute text-[#77cd3af2] opacity-[0.08]"
              style={{
                top: veg.top,
                left: veg.left,
                right: veg.right,
                bottom: veg.bottom,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [veg.rotate, veg.rotate + 10, veg.rotate],
              }}
              transition={{
                duration: veg.duration,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <veg.Icon size={veg.size} />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="bg-[#77cd3af2] p-6 text-white flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingBasket size={22} />
                <h2 className="text-xl font-bold">Order Management</h2>
              </div>
              <div className="flex gap-4 mt-1 opacity-80 text-[10px] uppercase font-bold tracking-widest">
                <span>Ref: {currentOrder._id?.slice(-10).toUpperCase()}</span>
                <span className="flex items-center gap-1">
                  <Calendar size={10} />{" "}
                  {new Date(currentOrder.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 rounded-full hover:bg-white/40 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* 1. SYNCED STEPPER */}
            <div className="relative flex justify-between items-center mb-6 px-2">
              <div className="absolute top-5 left-10 right-10 h-[2px] bg-gray-100 -z-0" />

              {orderStatuses.map((status, index) => {
                const isDone =
                  index <= currentIndex &&
                  currentOrder.orderStatus !== "Canceled";
                const isCurrent = index === currentIndex;

                return (
                  <div
                    key={status}
                    className="flex flex-col items-center relative z-10"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500
                      ${
                        isCurrent
                          ? "bg-[#77cd3af2] border-green-100 scale-125 shadow-lg shadow-green-200 text-white"
                          : isDone
                            ? "bg-green-100 border-transparent text-[#77cd3af2]"
                            : "bg-gray-50 border-transparent text-gray-300"
                      }`}
                    >
                      {status === "Canceled" ? (
                        <XCircle size={18} />
                      ) : isDone ? (
                        <CheckCircle size={18} />
                      ) : (
                        <Clock size={18} />
                      )}
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase mt-2 tracking-tighter transition-colors duration-500 ${isCurrent ? "text-gray-800" : "text-gray-400"}`}
                    >
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Logistics Info */}
              <div className="bg-gray-50/50 border border-gray-100 p-5 rounded-[30px] space-y-3">
                <h4 className="text-[10px] font-black uppercase text-[#77cd3af2] tracking-widest flex items-center gap-2">
                  <User size={14} /> Logistics Info
                </h4>
                <div>
                  <p className="font-bold text-gray-800">
                    {currentOrder.shippingInfo?.fullName}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Phone size={12} /> {currentOrder.shippingInfo?.phone}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-medium">
                    <MapPin size={12} /> {currentOrder.shippingInfo?.address},{" "}
                    {currentOrder.shippingInfo?.city}
                  </p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-gray-50/50 border border-gray-100 p-5 rounded-[30px] space-y-3">
                <h4 className="text-[10px] font-black uppercase text-[#77cd3af2] tracking-widest flex items-center gap-2">
                  <CreditCard size={14} /> Payment Method
                </h4>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                    <CreditCard className="text-gray-400" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700 capitalize">
                      {currentOrder.paymentInfo?.method || "COD"}
                    </p>
                    <p
                      className={`text-[10px] font-black uppercase ${currentOrder.paymentInfo?.status === "Paid" ? "text-green-500" : "text-orange-400"}`}
                    >
                      {currentOrder.paymentInfo?.status || "Pending"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Items */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">
                Parcel Contents
              </h4>
              <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2">
                {currentOrder.orderItems?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt=""
                        className="w-12 h-12 object-cover rounded-xl bg-gray-50"
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-800 leading-none">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">
                          ${item.price} x {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-black text-gray-700">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-[#77cd3af2]/5 p-6 rounded-[30px] border border-[#77cd3a1a] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-gray-400">
                  Ship Fee
                </span>
                <span className="text-xl font-black ">
                  ${currentOrder.shippingPrice?.toFixed(2)}
                </span>
                <span className="text-[10px] font-black uppercase text-gray-400">
                  Total Amount
                </span>
                <span className="text-3xl font-black text-[#77cd3af2]">
                  ${currentOrder.totalPrice?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer - SMART ACTIONS */}
          <div className="p-6 bg-white border-t border-gray-50 flex gap-3">
            {currentOrder.orderStatus !== "Canceled" &&
              currentOrder.orderStatus !== "Delivered" && (
                <button
                  onClick={() => handleStatusUpdate("Canceled")}
                  className="px-6 py-4 rounded-2xl font-bold text-xs text-red-400 hover:bg-red-50 transition-all uppercase tracking-widest"
                >
                  Cancel Order
                </button>
              )}

            {nextAction ? (
              <button
                onClick={() => handleStatusUpdate(nextAction.status)}
                className={`flex-1 ${nextAction.color} text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all`}
              >
                <nextAction.icon size={18} /> {nextAction.label}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 bg-gray-900 text-white rounded-2xl font-bold text-sm py-4"
              >
                Close View
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
