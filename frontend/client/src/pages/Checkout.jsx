import React, { useState, useEffect, Fragment, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  setOrderStep,
  placeOrder,
  resetOrder,
} from "../store/slices/orderSlice";
import {
  resetAddressState,
  calcFee,
  fetchProvinces,
} from "../store/slices/addressSlice";
import { clearCart } from "../store/slices/cartSlice";
import { trackClickThunk } from "../store/slices/interactionSlice";
import AddressSelection from "../components/Payment/AddressSelection";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  User,
  Mail,
  Phone,
  CreditCard,
  ShoppingBag,
  Truck,
} from "lucide-react";

/* ===================== TÁCH RIÊNG COMPONENT INPUT ĐỂ TRÁNH RE-RENDER ===================== */
const FormInput = ({ name, placeholder, icon: Icon, value, onChange, error }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
        <Icon size={18} />
      </div>
      <input
        name={name}
        placeholder={placeholder}
        value={value || ""}
        onChange={onChange}
        className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50/50 border outline-none transition-all duration-200 text-sm
          ${
            error
              ? "border-red-400 ring-2 ring-red-50 bg-red-50/10 focus:border-red-400"
              : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 bg-white"
          }`}
      />
      {error && (
        <p className="text-xs text-red-500 mt-1.5 ml-1 flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
};

/* ===================== STEP 1: SHIPPING ===================== */
const ShippingStep = ({
  shippingDetails,
  setShippingDetails,
  errors,
  setErrors,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100"
    >
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
        <div className="p-2 bg-[#8BDE4E] text-white rounded-lg">
          <Truck size={20} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">
          Shipping Information
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormInput 
          name="fullName" 
          placeholder="Full Name" 
          icon={User} 
          value={shippingDetails.fullName} 
          onChange={handleChange} 
          error={errors.fullName}
        />
        <FormInput 
          name="email" 
          placeholder="Email Address" 
          icon={Mail} 
          value={shippingDetails.email} 
          onChange={handleChange} 
          error={errors.email}
        />
        <FormInput 
          name="phone" 
          placeholder="Phone Number" 
          icon={Phone} 
          value={shippingDetails.phone} 
          onChange={handleChange} 
          error={errors.phone}
        />
        <div className="md:col-span-2">
          <FormInput
            name="address"
            placeholder="Street Address (House number, street name...)"
            icon={MapPin}
            value={shippingDetails.address}
            onChange={handleChange}
            error={errors.address}
          />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-50">
        <AddressSelection
          shippingDetails={shippingDetails}
          setShippingDetails={setShippingDetails}
          errors={errors}
          setErrors={setErrors}
        />
      </div>
    </motion.div>
  );
};

/* ===================== STEP 2: PAYMENT ===================== */
const PaymentStep = ({ paymentMethod, setPaymentMethod }) => {
  const Option = ({ value, title, desc, icon: Icon }) => (
    <div
      onClick={() => setPaymentMethod(value)}
      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative flex gap-4 items-start
        ${
          paymentMethod === value
            ? "border-[#8BDE4E] bg-[#8BDE4E]/10 shadow-sm shadow-emerald-100/50"
            : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
        }`}
    >
      <div
        className={`p-2.5 rounded-xl border ${paymentMethod === value ? "bg-white text-[#8BDE4E] border-[#8BDE4E]/30" : "bg-slate-50 text-slate-500 border-slate-100"}`}
      >
        <Icon size={20} />
      </div>

      <div className="flex-1 min-w-0 pr-6">
        <p className="font-semibold text-slate-800 text-sm md:text-base">
          {title}
        </p>
        <p className="text-xs md:text-sm text-slate-500 mt-1 leading-relaxed">
          {desc}
        </p>
      </div>

      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5
        ${paymentMethod === value ? "border-[#8BDE4E]" : "border-slate-300"}`}
      >
        {paymentMethod === value && (
          <div className="w-2.5 h-2.5 bg-[#8BDE4E] rounded-full" />
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100"
    >
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
        <div className="p-2 bg-[#8BDE4E] text-white rounded-lg">
          <CreditCard size={20} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Payment Method</h2>
      </div>

      <div className="grid gap-4">
        <Option
          value="Stripe"
          title="Credit / Debit Card (Stripe)"
          desc="Secure payment via Visa, Mastercard, JCB with end-to-end encryption."
          icon={CreditCard}
        />
        <Option
          value="COD"
          title="Cash on Delivery (COD)"
          desc="Pay with cash upon receiving your delivery."
          icon={Truck}
        />
      </div>
    </motion.div>
  );
};

/* ===================== STEP 3: CONFIRM ===================== */
const ConfirmStep = ({ shippingDetails, cart, paymentMethod }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100"
    >
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
        <div className="p-2 bg-[#8BDE4E] text-white rounded-lg">
          <CheckCircle2 size={20} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Confirm Order</h2>
      </div>

      <div className="bg-slate-50/80 border border-slate-100 p-5 rounded-xl text-sm space-y-3 mb-6">
        <div className="grid grid-cols-3 gap-2">
          <span className="text-slate-500">Recipient:</span>
          <span className="col-span-2 font-medium text-slate-800">
            {shippingDetails.fullName}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <span className="text-slate-500">Email:</span>
          <span className="col-span-2 font-medium text-slate-800">
            {shippingDetails.email}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <span className="text-slate-500">Phone:</span>
          <span className="col-span-2 font-medium text-slate-800">
            {shippingDetails.phone}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <span className="text-slate-500">Address:</span>
          <span className="col-span-2 font-medium text-slate-800">
            {shippingDetails.address}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <span className="text-slate-500">Payment:</span>
          <span className="col-span-2">
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
              {paymentMethod}
            </span>
          </span>
        </div>
      </div>

      <p className="text-sm font-semibold text-slate-700 mb-3">
        Items in Your Order
      </p>
      <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
        {cart.map((item) => {
          const imageUrl = item.image || item.product?.images?.[0]?.url || "https://via.placeholder.com/150";
          const productName = item.name || item.product?.name || "Product";
          const productPrice = item.price || item.product?.price || 0;
          const productId = item.product?._id || item.product;

          return (
            <div
              key={productId}
              className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-all duration-200"
            >
              <div className="w-16 h-16 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt={productName}
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150";
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold text-slate-800 text-sm truncate"
                  title={productName}
                >
                  {productName}
                </p>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>
                    Qty:{" "}
                    <strong className="text-slate-600 font-medium">
                      {item.quantity}
                    </strong>
                  </span>
                  <span className="text-slate-300">|</span>
                  <span>
                    Price:{" "}
                    <strong className="text-slate-600 font-medium">
                      ${productPrice.toLocaleString()}
                    </strong>
                  </span>
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="font-bold text-slate-700 text-sm">
                  ${(productPrice * item.quantity).toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

/* ===================== MAIN CHECKOUT COMPONENT ===================== */
const Checkout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const steps = ["Shipping", "Payment", "Confirmation"];

  const { authUser } = useSelector((state) => state.auth);
  const { cart, totalCart } = useSelector((state) => state.cart);
  
  const { shippingFee, loadingAddress } = useSelector((state) => state.address);
  const { activeStep, loading, shippingInfo, placingOrder } = useSelector(
    (state) => state.order,
  );

  useEffect(() => {
    dispatch(fetchProvinces());
  }, [dispatch]);

  const [shippingDetails, setShippingDetails] = useState({
    fullName: authUser?.name || "",
    email: authUser?.email || "",
    phone: authUser?.phone || "",
    address: shippingInfo?.address || "",
    provinceId: "",
    districtId: "",
    wardCode: "",
    country: "Vietnam",
  });

  const [paymentMethod, setPaymentMethod] = useState("Stripe");
  const [errors, setErrors] = useState({});

  const subtotal = totalCart > 0 
    ? totalCart 
    : (location.state?.subtotal || cart?.reduce((acc, item) => acc + (item.price || item.product?.price || 0) * item.quantity, 0) || 0);
    
  const totalAmount = Number((subtotal + shippingFee).toFixed(2));

  useEffect(() => {
    const { districtId, wardCode } = shippingDetails;
    if (
      districtId &&
      Number(districtId) > 0 &&
      wardCode &&
      cart.length > 0 &&
      !loadingAddress
    ) {
      const timeoutId = setTimeout(() => {
        dispatch(
          calcFee({
            cartItems: cart,
            to_district_id: districtId,
            to_ward_code: wardCode,
          }),
        );
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [shippingDetails.districtId, shippingDetails.wardCode, loadingAddress, cart, dispatch]);

  const validateShipping = () => {
    const newErrors = {};
    ["fullName", "email", "phone", "address"].forEach((key) => {
      if (!shippingDetails[key]) newErrors[key] = "This field is required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (placingOrder) return;
    
    const orderData = {
      shippingInfo: shippingDetails,
      paymentMethod: paymentMethod,
      orderItems: cart.map((item) => ({
        product: item.product?._id || item.product, 
        name: item.name || item.product?.name,
        price: item.price || item.product?.price,
        image: item.image || item.product?.images?.[0]?.url,
        quantity: item.quantity,
      })),
      totalPrice: totalAmount,
      shippingPrice: shippingFee,
      itemsPrice: subtotal,
    };

    try {
      const response = await dispatch(placeOrder(orderData)).unwrap();

      cart.forEach((item) => {
        const pId = item.product?._id || item.product;
        if (pId && typeof pId === 'string') {
          dispatch(
            trackClickThunk({ productId: pId, action: "order" }),
          );
        }
      });

      if (orderData.paymentMethod === "Stripe") {
        if (response?.url) {
          window.location.href = response.url;
        } else if (response?.clientSecret) {
          navigate("/stripe-payment", { state: { clientSecret: response.clientSecret } });
        } else {
          toast.error("Không tìm thấy đường dẫn thanh toán từ hệ thống Stripe!");
        }
      } else {
        dispatch(clearCart());
        dispatch(resetAddressState());
        dispatch(resetOrder());
        setShippingDetails({
          fullName: authUser?.name || "",
          email: authUser?.email || "",
          phone: authUser?.phone || "",
          address: "",
          provinceId: "",
          districtId: "",
          wardCode: "",
          country: "Vietnam",
        });
        navigate("/success");
      }
    } catch (error) {
      toast.error(error || "An error occurred while placing your order!");
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!validateShipping()) return;
      dispatch(setOrderStep(1));
    } else if (activeStep === 1) {
      dispatch(setOrderStep(2));
    } else {
      handlePlaceOrder();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      dispatch(setOrderStep(activeStep - 1));
    }
  };

  return (
    <main className="min-h-screen pt-8 pb-16 bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* STEP INDICATOR */}
        <div className="flex items-center justify-center max-w-xl mx-auto mb-10 bg-white p-2.5 rounded-xl shadow-xs border border-slate-100">
          {steps.map((step, i) => (
            <Fragment key={step}>
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-300">
                <div
                  className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center transition-all duration-300
                  ${
                    i <= activeStep
                      ? "bg-[#8BDE4E] text-white shadow-sm shadow-emerald-200"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-xs md:text-sm font-medium transition-all duration-300
                  ${i <= activeStep ? "text-slate-800 font-semibold" : "text-slate-400"}`}
                >
                  {step}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-2 bg-slate-100 rounded-full" />
              )}
            </Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {activeStep === 0 && (
                <ShippingStep
                  shippingDetails={shippingDetails}
                  setShippingDetails={setShippingDetails}
                  errors={errors}
                  setErrors={setErrors}
                />
              )}

              {activeStep === 1 && (
                <PaymentStep
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                />
              )}

              {activeStep === 2 && (
                <ConfirmStep
                  shippingDetails={shippingDetails}
                  cart={cart}
                  totalAmount={totalAmount}
                  paymentMethod={paymentMethod}
                />
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="lg:col-span-5 lg:sticky lg:top-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
                <ShoppingBag className="text-emerald-500" size={18} />
                <h3 className="text-base font-bold text-slate-800">
                  Order Summary
                </h3>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium text-slate-800">
                    ${subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Shipping Fee:</span>
                  <span className="font-medium text-slate-800">
                    {shippingFee > 0
                      ? `$${shippingFee.toLocaleString()}`
                      : "Free"}
                  </span>
                </div>

                <div className="border-t border-slate-100 my-4 pt-4" />

                <div className="flex justify-between items-baseline">
                  <span className="text-slate-800 font-semibold text-base">
                    Total:
                  </span>
                  <span className="text-2xl font-extrabold text-[#8BDE4E]">
                    ${totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={handleNext}
                  disabled={loading || placingOrder}
                  className="cursor-pointer w-full bg-[#8BDE4E] hover:bg-[#77cd3a] active:bg-emerald-700 text-white py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  {loading || placingOrder ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : activeStep === 2 ? (
                    "Place Order"
                  ) : (
                    <>
                      Continue
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {activeStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="cursor-pointer w-full bg-slate-50 hover:bg-slate-100 text-slate-600 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all border border-slate-200/60"
                  >
                    <ArrowLeft size={14} />
                    Go Back
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;