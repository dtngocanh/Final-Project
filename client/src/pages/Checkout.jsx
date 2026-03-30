import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setOrderStep, placeOrder } from '../store/slices/orderSlice';
import { Loader2, ArrowRight, CheckCircle, MapPin, ArrowLeft, User, Mail, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // FETCH DATA
  const { authUser } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const { activeStep, loading, shippingInfo } = useSelector((state) => state.order);

  // State local cho Form 
  const [shippingDetails, setShippingDetails] = useState({
    fullName: authUser?.name || "",
    email: authUser?.email || "",
    phone: authUser?.phone || "",
    address: shippingInfo?.address || "",
    city: shippingInfo?.city || "",
    country: shippingInfo?.country || ""
  });

  const subtotal = cart?.reduce((acc, item) => acc + item.product.price * item.quantity, 0) || 0;
  const shippingFee = 0; 
  const totalAmount = subtotal + shippingFee;

  const handleInputChange = (e) => {
    setShippingDetails({ ...shippingDetails, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!shippingDetails.address || !shippingDetails.city || !shippingDetails.phone) {
        return alert("Please fill all shipping details");
      }
      dispatch(setOrderStep(1));
    } else {
      const orderData = {
        shippingInfo: shippingDetails,
        orderItems: cart.map(item => ({
          product: item.product._id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.images[0]?.url,
          quantity: item.quantity
        }))
      };
      dispatch(placeOrder(orderData));
    }
  };

  return (
    <main className="min-h-screen pt-10 pb-20 bg-[#fcfdfb] antialiased text-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* THANH TIẾN TRÌNH (STEPS) */}
        <div className="flex justify-center items-center mb-16 gap-4">
          {['Shipping', 'Verify', 'Payment'].map((step, i) => (
            <React.Fragment key={step}>
              <div className={`flex items-center gap-3 ${i <= activeStep ? 'text-[#77cd3a]' : 'text-slate-300'}`}>
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all ${i <= activeStep ? 'border-[#77cd3a] bg-[#77cd3a] text-white shadow-lg shadow-[#77cd3a]/20' : 'border-slate-200'}`}>
                  {i + 1}
                </div>
                <span className="font-bold uppercase text-[10px] tracking-[0.2em] hidden md:block">{step}</span>
              </div>
              {i < 2 && <div className={`w-12 h-[2px] ${i < activeStep ? 'bg-[#77cd3a]' : 'bg-slate-100'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* CỘT TRÁI: FORM & VERIFY */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {activeStep === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100"
                >
                  <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <MapPin className="text-[#77cd3a]" /> SHIPPING DETAILS
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Full Name</label>
                      <input name="fullName" value={shippingDetails.fullName} onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#77cd3a] transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Email Address</label>
                      <input name="email" value={shippingDetails.email} onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#77cd3a] transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Phone Number</label>
                      <input name="phone" value={shippingDetails.phone} onChange={handleInputChange} placeholder="Required" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#77cd3a] transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Street Address</label>
                      <input name="address" value={shippingDetails.address} onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#77cd3a] transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">City</label>
                      <input name="city" value={shippingDetails.city} onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#77cd3a] transition-all" />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-10 rounded-[40px] shadow-sm border-2 border-[#77cd3a]/10"
                >
                  <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <CheckCircle className="text-[#77cd3a]" /> VERIFY INFORMATION
                  </h2>
                  
                  {/* Tóm tắt thông tin người nhận */}
                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <div className="p-5 bg-slate-50 rounded-3xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Recipient</p>
                      <p className="font-bold flex items-center gap-2"><User size={14}/> {shippingDetails.fullName}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-2"><Mail size={14}/> {shippingDetails.email}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-2"><Phone size={14}/> {shippingDetails.phone}</p>
                    </div>
                    <div className="p-5 bg-[#77cd3a]/5 rounded-3xl border border-[#77cd3a]/10">
                      <p className="text-[10px] font-bold text-[#77cd3a] uppercase mb-2">Shipping To</p>
                      <p className="text-slate-700 font-medium">{shippingDetails.address}, {shippingDetails.city}</p>
                    </div>
                  </div>

                  {/* Danh sách sản phẩm chi tiết */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Items In Order</p>
                    {cart.map((item) => (
                      <div key={item.product._id} className="flex items-center gap-4 py-3 border-b border-slate-50">
                        <img src={item.product.images[0]?.url} alt="" className="w-16 h-16 object-cover rounded-2xl bg-slate-100" />
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">{item.product.name}</h4>
                          <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-slate-900">${(item.product.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CỘT PHẢI: TỔNG TIỀN & ACTION */}
          <div className="lg:col-span-5 sticky top-10">
            <div className="bg-black text-white p-10 rounded-[50px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#77cd3a]/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#77cd3a] mb-10 flex items-center gap-3">
                <span className="w-6 h-[2px] bg-[#77cd3a]"></span> Order Summary
              </h3>

              <div className="space-y-5 mb-10">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                  <span className="font-bold">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Shipping</span>
                  <span className="text-[#77cd3a] font-bold">FREE</span>
                </div>
                <div className="h-px bg-slate-800 my-4" />
                <div>
                   <p className="text-[10px] font-bold text-[#77cd3a] uppercase tracking-[0.2em] mb-1 italic">Total Amount</p>
                   <div className="text-6xl font-light italic tracking-tighter text-[#77cd3a]">
                    ${totalAmount.toLocaleString()}
                   </div>
                </div>
              </div>

              <button 
                onClick={handleNext} 
                disabled={loading}
                className="w-full py-6 bg-[#77cd3a] hover:bg-[#88e045] text-black font-bold uppercase tracking-[0.2em] text-[12px] rounded-full transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  activeStep === 0 ? <>Verify & Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/></> : "Proceed to Payment"
                )}
              </button>

              {activeStep > 0 && (
                <button 
                  onClick={() => dispatch(setOrderStep(0))} 
                  className="w-full mt-4 text-slate-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={12} /> Edit Shipping Info
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default Checkout;