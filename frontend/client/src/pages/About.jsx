import { Users, Target, Award, Heart, Leaf, Carrot, Salad, Citrus, Cherry } from 'lucide-react';
import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion"; 

const About = () => {
  const { theme } = useTheme();
  const activeColor = theme === "dark" ? "#77cd3af2" : "#025c37";

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false },
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] }
  };

  const values = [
    { icon: Heart, title: 'Ethical Soul', description: 'Nature and heart at our core.' },
    { icon: Award, title: 'Premium Quality', description: 'Finest organic treasures.' },
    { icon: Users, title: 'Green Community', description: 'Sustainable future together.' },
    { icon: Target, title: 'Fresh Vision', description: 'Redefining organic living.' }
  ];

  // Danh sách rau củ quả để làm decor nền
  const vegies = [
    { Icon: Carrot, size: 120, top: '10%', left: '5%', delay: 0, rotate: 15 },
    { Icon: Salad, size: 180, top: '60%', left: '10%', delay: 2, rotate: -20 },
    { Icon: Citrus, size: 100, top: '20%', right: '15%', delay: 4, rotate: 45 },
    { Icon: Cherry, size: 80, bottom: '15%', right: '10%', delay: 1, rotate: -10 },
    { Icon: Leaf, size: 150, top: '45%', right: '5%', delay: 3, rotate: 10 },
  ];

  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-950 overflow-hidden transition-colors duration-500 pt-24 pb-32">
      
      {/* BACKGROUND DECOR: Vườn rau củ mờ ảo trôi nổi */}
      <div className="absolute inset-0 pointer-events-none">
        
        {/* Lớp loang màu nền (Glow) */}
        <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] bg-[#77cd3af2]/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] bg-[#025c37]/5 dark:bg-[#77cd3af2]/5 blur-[150px] rounded-full" />

        {/* Render danh sách rau củ trôi nổi */}
        {vegies.map((item, index) => (
          <motion.div
            key={index}
            style={{ 
              position: 'absolute', 
              top: item.top, 
              left: item.left, 
              right: item.right, 
              bottom: item.bottom 
            }}
            animate={{ 
              y: [0, 40, 0],
              rotate: [item.rotate, item.rotate + 20, item.rotate],
              opacity: [0.1, 0.25, 0.1]
            }}
            transition={{ 
              duration: 10 + index * 2, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: item.delay 
            }}
          >
            <item.Icon size={item.size} strokeWidth={0.5} style={{ color: activeColor }} />
          </motion.div>
        ))}

        {/* Các vòng tròn mờ cực mảnh để giữ độ sâu */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-[#77cd3af2] rounded-full blur-[1px]"
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        
        {/* HEADER: Chữ Pure Story xanh lè */}
        <motion.div {...fadeInUp} className="text-center mb-28">
          <div className="flex items-center justify-center gap-2 mb-6">
            <motion.div animate={{ rotate: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
              {/* <Leaf size={22} style={{ color: activeColor }} /> */}
              <img src="/hahahaha.png" alt="" style={{ color: activeColor }}/>
            </motion.div>
            <span className="uppercase tracking-[0.4em] text-[11px] font-bold dark:text-gray-400 opacity-60">Since 2026</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-light tracking-tighter text-gray-900 dark:text-white leading-tight">
            Our <span className="font-serif italic text-[#77cd3af2]">Pure Story</span>
          </h1>
        </motion.div>

        {/* VALUES: Dùng Backdrop blur để nhìn xuyên qua rau củ ở nền */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-32 mb-40">
          {values.map((value, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group flex flex-col items-center text-center relative"
            >
              <div className="relative mb-8 p-8 rounded-full bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl border border-white/20 dark:border-gray-800 z-10 group-hover:scale-110 transition-all duration-700">
                <value.icon size={32} strokeWidth={1} style={{ color: activeColor }} />
              </div>

              <h3 className="text-2xl font-light tracking-[0.2em] uppercase mb-4 text-gray-800 dark:text-white relative">
                {value.title}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-[#77cd3af2] group-hover:w-20 transition-all duration-500 shadow-[0_0_10px_#77cd3af2]" />
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-light max-w-xs italic">{value.description}</p>
            </motion.div>
          ))}
        </div>

        {/* STORY SECTION */}
        <motion.div 
          {...fadeInUp}
          className="relative p-10 md:p-24 bg-white/20 dark:bg-gray-950/20 backdrop-blur-2xl shadow-2xl rounded-[4rem] border border-white/30 dark:border-white/10 overflow-hidden"
        >
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-10 leading-tight">
              Living on the <br />
              <span className="font-serif italic text-[#77cd3af2] text-6xl drop-shadow-sm">Green Side</span>
            </h2>
            <div className="space-y-8 text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-light italic">
              <p>Veganic is a movement towards a <span className="text-gray-900 dark:text-white not-italic font-medium border-b border-[#77cd3af2]/30">conscious sanctuary</span>.</p>
              <p>Every choice here is a seed planted for a greener tomorrow.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default About;