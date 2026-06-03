import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  MapPin,
  CreditCard,
  User,
  CheckCircle2,
  Truck,
  Box,
  Star,
  RefreshCcw,
  MessageSquare,
  AlertTriangle,
  CalendarX,
} from "lucide-react";
import { motion } from "framer-motion";
import FloatingDecor from "../components/Fruit/FloatingDecor";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderDetails } from "../store/slices/orderSlice";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { orderDetail } = useSelector((state) => state.order);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderDetails(id));
    }
  }, [dispatch, id]);

  if (!orderDetail)
    return (
      <div className="pt-32 text-center font-fredoka uppercase tracking-[0.4em] text-gray-400">
        Cannot Fetch Order Details.
      </div>
    );

  const steps = ["Processing", "Shipped", "Delivered"];
  const currentStepIndex =
    orderDetail.orderStatus === "Canceled"
      ? -1
      : steps.indexOf(orderDetail.orderStatus);

  const isCanceled = orderDetail.orderStatus === "Canceled";

  return (
    <main className="min-h-screen pt-24 pb-16 bg-white dark:bg-[#060606] relative overflow-hidden font-fredoka transition-colors duration-700">
      <FloatingDecor />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-gray-400 hover:text-[#77cd3a] mb-8 transition-colors cursor-pointer"
        >
          <ChevronLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
            Back to history
          </span>
        </button>

        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-20">
          <div>
            <div className="flex items-center gap-3 text-[#77cd3a] mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                Order ID: {orderDetail?._id}
              </span>
              {orderDetail.orderStatus === "Canceled" && (
                <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                  Canceled
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-4xl tracking-tighter dark:text-white uppercase">
              Order{" "}
              <span className="border-b-2 border-[#77cd3af2]/30">details</span>
            </h1>
          </div>
          <div className="text-right border-l-2 border-[#77cd3a] pl-6 relative z-10">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#77cd3a] blur-[50px] rounded-full opacity-10" />
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 relative z-10">
              Date placed
            </p>
            <p className="text-xl dark:text-white font-medium relative z-10">
              {new Date(orderDetail.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {isCanceled ? (
              <motion.section
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50/50 dark:bg-red-950/10 backdrop-blur-xl rounded-[32px] border border-red-100 dark:border-red-900/20 p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 blur-[80px] rounded-full opacity-10 -z-0" />

                <div className="flex flex-col sm:flex-row gap-5 items-start relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20 flex-shrink-0">
                    <AlertTriangle size={22} />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-lg text-red-600 dark:text-red-400 uppercase tracking-wide">
                      This order was canceled
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Your order has been completely cancelled. If this was a
                      mistake, or you wish to order these items again, you can
                      use the{" "}
                      <span className="font-bold text-black dark:text-white">
                        "Reorder"
                      </span>{" "}
                      button on each item below to quickly rebuild your cart.
                    </p>

                    {orderDetail.cancelReason && (
                      <div className="mt-2 p-3.5 bg-white dark:bg-white/[0.02] border border-red-100/50 dark:border-red-900/20 rounded-2xl">
                        <span className="text-[9px] font-black uppercase tracking-widest text-red-500 block mb-1">
                          Reason for cancellation:
                        </span>
                        <span className="text-xs text-gray-700 dark:text-gray-300 font-medium italic">
                          "{orderDetail.cancelReason}"
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase tracking-wider pt-1">
                      <CalendarX size={12} />
                      <span>
                        Canceled on:{" "}
                        {new Date(orderDetail.updatedAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.section>
            ) : (
              /* Tracker Section  */
              <section className="bg-gray-50/50 dark:bg-white/[0.02] backdrop-blur-xl rounded-[32px] border border-gray-100 dark:border-white/5 p-10 relative overflow-hidden">
                <div className="flex justify-between relative z-10">
                  {steps.map((step, idx) => (
                    <div
                      key={step}
                      className="flex flex-col items-center z-10 flex-1"
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-700 ${
                          idx <= currentStepIndex
                            ? "bg-[#77cd3a] border-[#77cd3a] text-black shadow-lg shadow-[#77cd3a]/30"
                            : "bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-400"
                        }`}
                      >
                        {step === "Processing" && <Box size={20} />}
                        {step === "Shipped" && <Truck size={20} />}
                        {step === "Delivered" && <CheckCircle2 size={20} />}
                      </div>
                      <p
                        className={`mt-4 text-[9px] font-black uppercase tracking-widest ${
                          idx <= currentStepIndex
                            ? "dark:text-white text-black"
                            : "text-gray-400"
                        }`}
                      >
                        {step}
                      </p>
                    </div>
                  ))}
                  <div className="absolute top-6 left-0 w-full h-[2px] bg-gray-100 dark:bg-white/5 -z-0" />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        (currentStepIndex / (steps.length - 1)) * 100
                      }%`,
                    }}
                    className="absolute top-6 left-0 h-[2px] bg-[#77cd3a] -z-0"
                  />
                </div>
              </section>
            )}

            {/* Items Summary Section */}
            <section className="space-y-4">
              <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 px-2">
                Order Items ({orderDetail?.orderItems?.length})
              </h2>
              {orderDetail?.orderItems?.map((item, idx) => {
                // LOGIC PHÂN TÁCH SECTION COMBO / STANDARD KHÁCH ĐÃ MUA:
                const isComboPurchase = item.price < (item.product?.price || item.price);

                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex flex-col sm:flex-row sm:items-center gap-6 bg-gray-50/40 dark:bg-white/[0.01] backdrop-blur-sm rounded-[30px] p-5 border border-gray-100 dark:border-white/5 group transition-all"
                  >
                    <Link
                      to={`/product/${item.product?._id || ""}`}
                      className="w-24 h-24 rounded-2xl bg-white dark:bg-black overflow-hidden shadow-inner border border-gray-100 dark:border-white/5 flex-shrink-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </Link>

                    <div className="flex-1">
                      <Link
                        to={`/product/${item.product?._id || ""}`}
                        className="text-md font-bold dark:text-white uppercase tracking-tight hover:text-[#77cd3a] transition-colors"
                      >
                        {item.name}
                      </Link>
                      
                      {/* Cụm hiển thị phân tách giá Combo vs Thường */}
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {isComboPurchase ? (
                          <span className="text-[8px] font-black bg-[#77cd3a]/10 text-[#77cd3a] px-2 py-0.5 rounded uppercase tracking-wider">
                            Combo
                          </span>
                        ) : (
                          <span className="text-[8px] font-black bg-gray-100 dark:bg-white/5 text-gray-400 px-2 py-0.5 rounded uppercase tracking-wider">
                            Standard
                          </span>
                        )}

                        <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em]">
                          Unit: ${item.price.toFixed(2)}
                          {isComboPurchase && item.product?.price && (
                            <span className="line-through text-gray-400/40 ml-1.5 font-normal">
                              ${item.product.price.toFixed(2)}
                            </span>
                          )}
                          <span className="text-gray-300 dark:text-white/10 mx-1">|</span> Qty: {item.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 min-w-[160px]">
                      {/* Khối hiển thị tổng tiền cho item */}
                      <div className="flex items-baseline gap-2">
                        {isComboPurchase && item.product?.price ? (
                          <>
                            <span className="text-xs line-through text-gray-400/40">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </span>
                            <span className="text-lg font-bold text-[#77cd3a]">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <p className="text-lg font-bold dark:text-white">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {(orderDetail?.orderStatus === "Canceled" ||
                          orderDetail?.orderStatus === "Delivered") && (
                          <button
                            onClick={() =>
                              navigate(`/product/${item.product?._id || ""}`)
                            }
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 text-gray-500 hover:text-[#77cd3a] rounded-xl border border-gray-100 dark:border-white/5 transition-all shadow-sm active:scale-95 group cursor-pointer"
                          >
                            <RefreshCcw
                              size={14}
                              className="group-hover:rotate-180 transition-transform duration-500"
                            />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              Reorder
                            </span>
                          </button>
                        )}

                        {orderDetail.orderStatus === "Delivered" && (
                          <Link
                            to={`/product/${item.product?._id || ""}#reviews`}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#77cd3a] text-black rounded-xl text-[9px] font-black uppercase tracking-tighter hover:bg-[#86e041] transition-all shadow-lg shadow-[#77cd3a]/20 active:scale-95 group/btn overflow-hidden relative inline-flex"
                          >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                            <Star size={12} fill="currentColor" />
                            <span>Review Item</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </section>
          </div>

          {/* Sidebar Section */}
          <div className="space-y-6">
            <section className="relative overflow-hidden rounded-[28px] border border-gray-100/70 dark:border-white/10 p-6 bg-white dark:bg-black/20 group shadow-none">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#77cd3a] rounded-full blur-[70px] opacity-15 group-hover:opacity-30 transition-opacity duration-700 z-0" />

              <h3 className="text-[9px] font-black uppercase tracking-[0.4em] mb-7 text-gray-400 relative z-10">
                Shipment details
              </h3>

              <div className="space-y-5 relative z-10">
                <div className="flex gap-4 items-center">
                  <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-[#77cd3a] border border-gray-100 dark:border-white/10">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] uppercase font-black tracking-wider text-gray-400 mb-0.5">
                      Customer
                    </p>
                    <p className="text-sm font-bold uppercase tracking-wide dark:text-white">
                      {orderDetail.shippingInfo.fullName}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-[#77cd3a] border border-gray-100 dark:border-white/10">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] uppercase font-black tracking-wider text-gray-400 mb-0.5">
                      Shipping Address
                    </p>
                    <p className="text-[11px] leading-normal dark:text-white/70 uppercase font-medium tracking-wide">
                      {orderDetail.shippingInfo.address},{" "}
                      {orderDetail.shippingInfo.city},{" "}
                      {orderDetail.shippingInfo.country}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Price Summary */}
            <section className="bg-gray-50/50 dark:bg-white/[0.02] backdrop-blur-md border border-gray-100 dark:border-white/5 rounded-[35px] p-8 relative overflow-hidden">
              <div className="flex justify-between items-end mb-8 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#77cd3a]">
                  Final total
                </span>
                <span className="text-4xl font-light dark:text-white leading-none">
                  ${orderDetail.totalPrice.toFixed(2)}
                </span>
              </div>

              <Link
                to="/contact"
                className="w-full mb-6 py-4 border border-[#77cd3a]/30 hover:border-[#77cd3a] dark:text-white text-black rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 bg-transparent"
              >
                <MessageSquare size={16} />
                Need Support?
              </Link>

              <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex items-center gap-3 relative z-10">
                <div className="p-2.5 rounded-xl bg-[#77cd3a]/10 text-[#77cd3a]">
                  <CreditCard size={16} />
                </div>

                <div className="flex flex-col gap-1.5 relative z-10 font-fredoka">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400/80 dark:text-gray-500">
                    Payment Status
                  </span>

                  <div className="flex items-center flex-wrap gap-2 text-sm font-bold uppercase tracking-wider">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black tracking-widest ${
                        orderDetail?.paymentInfo?.status === "Paid"
                          ? "bg-[#77cd3a]/10 text-[#77cd3a]"
                          : orderDetail?.paymentInfo?.status === "Pending"
                          ? "bg-amber-500/10 text-amber-500 animate-pulse"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {orderDetail?.paymentInfo?.status}
                    </span>

                    <span className="text-gray-400 dark:text-gray-500 font-medium lowercase text-xs">
                      via
                    </span>

                    <span className="font-black text-gray-700 dark:text-white border-b border-gray-200 dark:border-white/10 pb-0.5 text-xs">
                      {orderDetail?.paymentInfo?.method}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderDetail;