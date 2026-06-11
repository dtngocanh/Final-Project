import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  MapPin,
  Navigation,
  Mail,
  User,
  Phone,
  Globe,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const ShippingForm = ({ shippingDetails, setShippingDetails }) => {
  // 1. Lấy authUser từ Redux (Thay 'state.auth.authUser' cho đúng store của bạn)
  const { authUser } = useSelector((state) => state.auth);

  // 2. Auto-fill & set default DB values
  useEffect(() => {
    if (authUser) {
      setShippingDetails((prev) => ({
        ...prev,
        fullName: authUser.name || "",
        email: authUser.email || "",
        phone: authUser.phone || "",
        shippingFee: 7,
        distance: "5.0",
      }));
    }
  }, [authUser, setShippingDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 antialiased selection:bg-[#77cd3a]/20 font-sans">
      {/* Main Card - Clean White Style */}
      <div className="bg-white p-8 md:p-14 rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
        {/* Subtle Background Decor - Giúp form có chiều sâu nhưng vẫn trắng trẻo */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#77cd3a]/5 rounded-full blur-[80px]"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-50/30 rounded-full blur-[80px]"></div>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#77cd3a]/10 px-3 py-1 rounded-full mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#77cd3a] animate-pulse"></span>
              <span className="text-[#4a8a1c] text-[10px] font-black uppercase tracking-widest">
                Step 01: Delivery
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-light text-center text-gray-800 dark:text-white mb-10 tracking-tight">
              Checkout{" "}
              <span className="font-serif italic border-b-2 border-[#77cd3af2]/30">
                page
              </span>
            </h2>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 relative z-10">
          {/* Form Fields */}
          {[
            {
              label: "Full Name",
              name: "fullName",
              icon: User,
              placeholder: "John Doe",
            },
            {
              label: "Email Address",
              name: "email",
              icon: Mail,
              placeholder: "hello@Veggies.com",
            },
            {
              label: "Phone Number",
              name: "phone",
              icon: Phone,
              placeholder: "09xx xxx xxx",
            },
            {
              label: "City",
              name: "city",
              icon: Globe,
              placeholder: "Da Nang City",
            },
          ].map((field) => (
            <div key={field.name} className="group">
              <label className="text-[11px] font-medium tracking-widest ml-2 mb-2 block group-focus-within:text-[#77cd3a] transition-colors">
                {field.label}
              </label>
              <div className="relative group/input">
                <field.icon
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-[#77cd3a] transition-all duration-300"
                  size={18}
                />
                <input
                  type="text"
                  name={field.name}
                  placeholder={field.placeholder}
                  value={shippingDetails[field.name] || ""}
                  onChange={handleChange}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 focus:border-[#77cd3a]/40 focus:bg-white focus:ring-4 ring-[#77cd3a]/5 outline-none transition-all duration-300 text-slate-800 font-semibold placeholder:text-slate-300 placeholder:font-normal"
                />
              </div>
            </div>
          ))}

          {/* Street Address - Chiếm 2 cột */}
          <div className="md:col-span-2 group">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block group-focus-within:text-[#77cd3a] transition-colors">
              Street Address
            </label>
            <div className="relative group/input">
              <MapPin
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-[#77cd3a] transition-all duration-300"
                size={18}
              />
              <input
                type="text"
                name="street"
                placeholder="Ex: 123 Tran Dai Nghia Street, Ngu Hanh Son District..."
                value={shippingDetails.street || ""}
                onChange={handleChange}
                className="w-full pl-14 pr-6 py-5 bg-slate-50/50 rounded-2xl border border-slate-100 focus:border-[#77cd3a]/40 focus:bg-white focus:ring-4 ring-[#77cd3a]/5 outline-none transition-all duration-300 text-slate-800 font-bold placeholder:text-slate-300 placeholder:font-normal"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingForm;
