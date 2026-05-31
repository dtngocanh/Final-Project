import React from 'react';
import { motion } from 'framer-motion';
import { Truck, ShieldCheck, Headphones, RefreshCw } from 'lucide-react';

const FeatureSection = () => {
  const features = [
    {
      icon: Truck,
      title: 'Global Delivery',
      description: 'Free shipping on all orders over $50',
      deco: "/kale.png", // Thêm ảnh rau củ nhỏ tương ứng
      offset: "-20px"
    },
    {
      icon: ShieldCheck,
      title: 'Secure Payment',
      description: '100% SSL protected transactions',
      deco: "/berry.png",
      offset: "15px"
    },
    {
      icon: Headphones,
      title: 'Expert Support',
      description: 'Dedicated assistance 24/7 anytime',
      deco: "/cheri1.png",
      offset: "-10px"
    },
    {
      icon: RefreshCw,
      title: 'Easy Returns',
      description: '30-day peace of mind guarantee',
      deco: "/quat.png",
      offset: "20px"
    }
  ];

  return (
    <section className="relative py-28 bg-white dark:bg-[#050505] overflow-hidden transition-colors duration-700">
      
      {/* DECOR NỀN: Lá bay lơ lửng ở các góc section */}
      <motion.img 
        animate={{ y: [0, 20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        src="/xalach.png" 
        className="absolute -left-10 top-10 w-32 opacity-10 dark:opacity-5 blur-[2px] pointer-events-none"
      />
      <motion.img 
        animate={{ y: [0, -30, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        src="/broli.png" 
        className="absolute -right-10 bottom-10 w-40 opacity-10 dark:opacity-5 blur-[3px] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-0">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`group relative px-10 flex flex-col items-center lg:items-start text-center lg:text-left 
                ${index !== features.length - 1 ? 'lg:border-r border-gray-100 dark:border-white/5' : ''}`}
            >
              
              {/* VÙNG ICON & RAU CỦ BAY NHỎ */}
              <div className="relative mb-8">
                {/* Rau củ decor bay quanh icon */}
                <motion.img
                  src={feature.deco}
                  animate={{ 
                    y: [0, -10, 0], 
                    rotate: [0, 20, 0],
                    scale: [1, 1.1, 1] 
                  }}
                  transition={{ duration: 4 + index, repeat: Infinity }}
                  className="absolute -top-6 -right-6 w-10 h-10 object-contain z-20 drop-shadow-md grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500"
                  style={{ marginTop: feature.offset }}
                />

                <div className="w-16 h-16 rounded-[2rem] bg-gray-50 dark:bg-white/5 flex items-center justify-center transition-all duration-700 group-hover:rounded-2xl group-hover:bg-[#77cd3a]/10 group-hover:rotate-6">
                  <feature.icon 
                    size={26} 
                    strokeWidth={1.2} 
                    className="text-gray-400 dark:text-gray-500 group-hover:text-[#77cd3a] transition-all duration-500" 
                  />
                </div>
                
                {/* Quầng sáng nhẹ khi hover */}
                <div className="absolute inset-0 bg-[#77cd3a]/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>

              {/* TEXT CONTENT */}
              <div className="w-full relative">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#025c37] dark:text-[#77cd3af2] mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-sm font-light text-gray-500 dark:text-gray-400 leading-relaxed mb-6 h-10">
                  {feature.description}
                </p>

                {/* LINE ANIMATION ĐẶC TRƯNG */}
                <div className="h-[1px] w-full bg-gray-100 dark:bg-white/5 relative">
                  <motion.div 
                    className="absolute inset-0 bg-[#77cd3a]"
                    initial={{ width: "0%" }}
                    whileInView={{ width: "20%" }} // Mặc định hiện 1 ít cho đẹp
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                </div>

                {/* CHỮ "FRESH" CHẠY MỜ (NGỰA NHẸ) */}
                <div className="absolute -bottom-6 left-0 overflow-hidden h-4">
                  <span className="text-[8px] font-serif italic text-gray-300 dark:text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-full group-hover:translate-y-0 block uppercase tracking-widest">
                    Pure & Organic
                  </span>
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;