import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Leaf } from "lucide-react";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setEmail("");
    }, 3000);
  };

  return (
    <section className="relative py-20 bg-white dark:bg-[#050505] transition-colors duration-700">
      
      {/* GLOW NỀN (Giúp chế độ tối có chiều sâu) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#77cd3a]/10 blur-[120px] pointer-events-none rounded-full dark:opacity-40" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* CONTAINER NHỎ GỌN */}
        <div className="relative overflow-hidden bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[3rem] p-10 md:p-16 text-center backdrop-blur-sm shadow-xl dark:shadow-none">
          
          {/* ICON TRANG TRÍ CỰC XINH */}
          <motion.div 
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute -top-4 -right-4 w-20 h-20 opacity-20 dark:opacity-40"
          >
            <img src="/berry.png" alt="" className="w-full h-full object-contain blur-[1px]" />
          </motion.div>

          {/* HEADER TỐI GIẢN */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-4 text-[#025c37] dark:text-[#77cd3af2]">
              {/* <Leaf size={14} fill="currentColor" /> */}
              <img src="/hahahaha.png"/>
              <span className="uppercase tracking-[0.4em] text-[9px] font-black">Veggies</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white tracking-tight leading-tight">
              Get <span className="font-serif italic border-b-2 border-[#77cd3af2]/40">10% Off</span> Today
            </h2>
            <p className="mt-4 text-xs md:text-sm text-gray-500 dark:text-gray-400 font-light max-w-sm mx-auto">
              Join our newsletter and receive a special discount on your first organic basket.
            </p>
          </div>

          {/* FORM: INPUT & BUTTON NẰM TRÊN MỘT DÒNG (THU NHỎ) */}
          <form onSubmit={handleSubmit} className="relative max-w-md mx-auto">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col sm:flex-row items-center gap-3"
                >
                  <div className="relative flex-grow w-full group">
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-full px-6 py-3 text-sm outline-none focus:border-[#77cd3af2] dark:focus:border-[#77cd3af2] transition-all duration-300 placeholder:text-gray-300 dark:placeholder:text-gray-700 text-gray-800 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-[#025c37] dark:bg-[#77cd3af2] text-white dark:text-black px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#77cd3af2]/20"
                  >
                    Subscribe
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-2 flex items-center justify-center gap-2 text-[#77cd3af2]"
                >
                  <Sparkles size={16} />
                  <span className="font-serif italic text-lg tracking-wide">Check your inbox!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* FOOTER */}
          <div className="mt-8 flex items-center justify-center gap-4 text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">
            <span>Weekly Tips</span>
            <div className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-800" />
            <span>Organic Love</span>
            <div className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-800" />
            <span>Eco-Friendly</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;