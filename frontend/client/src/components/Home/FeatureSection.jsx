import React from 'react';
import { motion } from 'framer-motion';
import { Truck, ShieldCheck, Headphones, RefreshCw } from 'lucide-react';

const FeatureSection = () => {
  const features = [
    {
      icon: Truck,
      title: 'Global Delivery',
      description: 'Free shipping on all orders over $50',
      deco: "/kale.png", 
    },
    {
      icon: ShieldCheck,
      title: 'Secure Payment',
      description: '100% SSL protected transactions',
      deco: "/berry.png",
    },
    {
      icon: Headphones,
      title: 'Expert Support',
      description: 'Dedicated assistance 24/7 anytime',
      deco: "/cheri1.png",
    },
    {
      icon: RefreshCw,
      title: 'Easy Returns',
      description: '30-day peace of mind guarantee',
      deco: "/quat.png",
    }
  ];

  return (
    <section className="relative py-12 md:py-24 bg-white dark:bg-[#050505] overflow-hidden transition-colors duration-700">
      
      {/* DECOR NỀN: Thu nhỏ kích thước trên Mobile để tránh đè chữ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.img 
          animate={{ y: [0, 15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          src="/xalach.png" 
          className="absolute -left-10 top-5 w-24 md:w-32 opacity-10 dark:opacity-5 blur-[1px]"
        />
        <motion.img 
          animate={{ y: [0, -20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          src="/broli.png" 
          className="absolute -right-10 bottom-5 w-28 md:w-40 opacity-10 dark:opacity-5 blur-[2px]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* RESPONSIVE GRID LAYOUT:
            - Mobile (<640px): Chia 2 cột gọn gàng (2 hàng, mỗi hàng 2 ô)
            - Desktop (>=1024px): 4 cột thẳng hàng, ngăn cách bằng border dọc */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-8 lg:gap-0">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              viewport={{ once: true }}
              className={`group relative px-3 sm:px-6 lg:px-10 flex flex-col items-center lg:items-start text-center lg:text-left 
                ${index !== features.length - 1 ? 'lg:border-r border-gray-100 dark:border-white/5' : ''}`}
            >
              
              {/* VÙNG ICON & DECOR */}
              <div className="relative mb-4 md:mb-6">
                {/* Rau củ bay quanh icon: dùng CSS Class gánh mượt phần cứng */}
                <img
                  src={feature.deco}
                  alt="decor"
                  className="absolute -top-4 -right-4 w-7 h-7 md:w-9 md:h-9 object-contain z-20 drop-shadow-md grayscale-[0.3] group-hover:grayscale-0 custom-feature-float"
                  style={{ animationDelay: `${index * 0.4}s` }}
                />

                {/* Khung chứa Icon */}
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[2rem] bg-neutral-50 dark:bg-white/5 flex items-center justify-center transition-all duration-500 group-hover:rounded-2xl group-hover:bg-[#77cd3a]/10 group-hover:rotate-6 transform-gpu">
                  <feature.icon 
                    className="w-5 h-5 md:w-7 md:h-7 text-gray-400 dark:text-gray-500 group-hover:text-[#77cd3a] transition-colors duration-300" 
                    strokeWidth={1.5} 
                  />
                </div>
                
                {/* Quầng sáng nhẹ khi hover */}
                <div className="absolute inset-0 bg-[#77cd3a]/15 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>

              {/* TEXT CONTENT */}
              <div className="w-full relative flex flex-col items-center lg:items-start">
                <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[#025c37] dark:text-[#77cd3af2] mb-1.5 md:mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-xs md:text-sm font-light text-gray-500 dark:text-gray-400 leading-relaxed mb-4 lg:mb-6 min-h-[32px] md:min-h-[40px] max-w-[160px] sm:max-w-none">
                  {feature.description}
                </p>

                {/* LINE ANIMATION: Đã sửa đồng bộ chạy bằng Tailwind Group-hover */}
                <div className="h-[1px] w-full bg-gray-100 dark:bg-white/5 relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-[#77cd3a] w-full -translate-x-[80%] lg:-translate-x-[75%] group-hover:translate-x-0 transition-transform duration-500 ease-out transform-gpu" />
                </div>

                {/* CHỮ "PURE & ORGANIC" CHẠY MỜ */}
                <div className="absolute -bottom-5 left-0 right-0 lg:right-auto overflow-hidden h-4 hidden sm:block">
                  <span className="text-[8px] font-serif italic text-gray-400 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-full group-hover:translate-y-0 block uppercase tracking-widest text-center lg:text-left">
                    Pure & Organic
                  </span>
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      </div>

      {/* CSS ÉP CHIP ĐỒ HỌA ĐIỆN THOẠI XỬ LÝ SIÊU MƯỢT */}
      <style>{`
        .custom-feature-float {
          animation: featureFloat 4s ease-in-out infinite;
          will-change: transform;
          transform: translateZ(0);
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }

        @media (min-width: 1024px) {
          .group:hover .custom-feature-float {
            transform: scale3d(1.15, 1.15, 1) translate3d(2px, -4px, 0) !important;
            animation-play-state: paused;
          }
        }

        @keyframes featureFloat {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(0, -5px, 0) rotate(8deg); }
        }
      `}</style>
    </section>
  );
};

export default FeatureSection;