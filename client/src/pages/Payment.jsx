import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import FloatingDecor from "../components/Fruit/FloatingDecor";
import PaymentForm from "../components/PaymentForm";
import ShippingForm from "../components/Payment/ShippingForm";
import { placeOrder } from "../store/slices/orderSlice";

const stripePromise = loadStripe("pk_test_51PVw62JBUE6Jizh618546mKw0rO2IMDwBI8UlWRkbZ7XVlTgqyXc7yeGjYpsnsuM6eyRwtGZzRLBPwXoUoFBCio00YHiKvI");

const Payment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { authUser } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const { orderStep, placingOrder, paymentIntent } = useSelector((state) => state.order);

  const [distance, setDistance] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingDetails, setShippingDetails] = useState({
    fullName: authUser?.name || "",
    email: authUser?.email || "",
    phone: authUser?.phone || "",
    street: "",
    city: "",
    country: "Vietnam",
  });

  const subtotal = location.state?.subtotal || cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalAmount = subtotal + shippingFee;

  return (
    <main className="min-h-screen pt-28 pb-20 bg-[#fcfdfb] font-sans antialiased relative overflow-hidden text-slate-900">
      <FloatingDecor />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Nút Back tinh tế */}
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center gap-2 text-slate-400 hover:text-[#77cd3a] mb-12 text-[10px] uppercase font-black tracking-[0.2em] transition-all"
        >
          <div className="p-2 rounded-full bg-white shadow-sm group-hover:shadow-md transition-all">
            <ArrowLeft size={14} />
          </div>
          Back to Bag
        </button>

        {/* Bố cục Grid 12 cột chính xác */}
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* CỘT TRÁI: FORM NHẬP LIỆU (7 CỘT) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {orderStep === 1 ? (
                <motion.div 
                  key="step1" 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white p-10 md:p-16 rounded-[60px] shadow-[0_20px_60px_rgba(0,0,0,0.02)] border border-slate-50"
                >
                  <ShippingForm 
                    shippingDetails={shippingDetails}
                    setShippingDetails={setShippingDetails}
                    setDistance={setDistance}
                    setShippingFee={setShippingFee}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="step2" 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="bg-white p-10 md:p-16 rounded-[60px] shadow-2xl border-4 border-[#77cd3a]/20"
                >
                  <div className="mb-8 flex items-center gap-4">
                    <div className="p-3 bg-[#77cd3a] rounded-2xl text-white shadow-lg">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight">PAYMENT METHOD</h3>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Step 02: Verification</p>
                    </div>
                  </div>
                  <Elements stripe={stripePromise} options={{ clientSecret: paymentIntent }}>
                    <PaymentForm shippingDetails={shippingDetails} totalAmount={totalAmount} />
                  </Elements>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CỘT PHẢI: ORDER SUMMARY (5 CỘT) */}
          <div className="lg:col-span-5 sticky top-32">
            <div className="bg-white p-10 md:p-14 rounded-[60px] shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-slate-50 relative overflow-hidden">
              {/* Decor mờ nhẹ cho Summary */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#77cd3a]/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#77cd3a] mb-12 flex items-center gap-3">
                <span className="w-6 h-[2px] bg-[#77cd3a]"></span>
                Order Summary
              </h3>
              
              <div className="space-y-6 mb-12">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                  <span className="text-slate-900 font-black">${subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Shipping Fee</span>
                  <span className={`font-black ${shippingFee === 0 ? "text-[#77cd3a]" : "text-slate-900"}`}>
                    {shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="h-px bg-slate-100 my-8" />
                
                <div className="relative">
                   <p className="text-[10px] font-black text-[#77cd3a] uppercase tracking-[0.2em] mb-2 italic">Total Amount</p>
                   <div className="text-8xl font-light italic tracking-tighter text-[#77cd3a] leading-none">
                    ${totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              {orderStep === 1 && (
                <button 
                  onClick={() => dispatch(placeOrder({ shippingInfo: shippingDetails, orderItems: cart, totalPrice: totalAmount }))}
                  disabled={placingOrder || !shippingDetails.street}
                  className="w-full py-7 bg-[#e8f5e9] hover:bg-[#77cd3a] text-[#77cd3a] hover:text-white font-black uppercase tracking-[0.25em] text-[12px] rounded-full transition-all duration-500 shadow-sm hover:shadow-[0_20px_40px_rgba(119,205,58,0.2)] flex items-center justify-center gap-4 disabled:opacity-20 disabled:cursor-not-allowed group"
                >
                  {placingOrder ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      Verify & Continue
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                        <ArrowLeft size={14} className="rotate-180" />
                      </div>
                    </>
                  )}
                </button>
              )}
              
              {/* Khoảng cách ảo để báo user biết phí tính theo km */}
              <div className="mt-8 text-center">
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-relaxed">
                  Calculated based on <span className="text-slate-400">{distance.toFixed(1)} km</span> distance <br /> from Veganic Store DUE
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        body { background-color: #fcfdfb; }
        ::selection { background: #77cd3a; color: white; }
      `}} />
    </main>
  );
};

export default Payment;