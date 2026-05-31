import { Link } from 'react-router-dom';
import { 
  Mail, MapPin, Facebook, Twitter, Instagram, Youtube, 
  Carrot, Salad 
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { motion } from "framer-motion";

const Footer = () => {
  const { theme } = useTheme();
  const activeColor = theme === "dark" ? "#77cd3af2" : "#025c37";

  const footerLinks = {
    company: [
      { name: "Our Story", path: "/about" },
      { name: "Green Careers", path: "#" },
      { name: "Organic Blog", path: "#" },
    ],
    customer: [
      { name: "Contact Us", path: "/contact" },
      { name: "FAQ", path: "/faq" },
      { name: "Shipping Info", path: "#" },
    ],
    legal: [
      { name: "Privacy Policy", path: "#" },
      { name: "Terms of Service", path: "#" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Youtube, href: "#" },
  ];

  return (
    <footer className="relative bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900/50 overflow-hidden transition-colors duration-500">
      
      {/* HIỆU ỨNG LOANG XANH (AURA GRADIENT) - Đã tối ưu cho cả Dark Mode */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Đốm loang bên trái - Trong Dark Mode sẽ sáng hơn xíu để tạo chiều sâu */}
        <div 
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[140px] opacity-[0.12] dark:opacity-[0.18]"
          style={{ backgroundColor: activeColor }}
        />
        {/* Đốm loang bên phải dưới - Tạo hiệu ứng hắt sáng từ góc */}
        <div 
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-[160px] opacity-[0.1] dark:opacity-[0.15]"
          style={{ backgroundColor: activeColor }}
        />
        {/* Đốm loang chạy ngang ở giữa để làm nền cho chữ */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] blur-[120px] opacity-[0.05] dark:opacity-[0.08]"
          style={{ backgroundColor: activeColor }}
        />
      </div>

      {/* DECOR RAU CỦ TRÔI: Dùng stroke mảnh để nhìn sang */}
      <div className="absolute inset-0 pointer-events-none opacity-10 dark:opacity-20">
        <motion.div 
          animate={{ y: [0, -25, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 -left-16"
        >
          <Carrot size={220} strokeWidth={0.15} style={{ color: activeColor }} />
        </motion.div>
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-0 right-[-60px]"
        >
          <Salad size={180} strokeWidth={0.15} style={{ color: activeColor }} />
        </motion.div>
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-12 md:px-24 py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24">
          
          {/* BRAND SECTION */}
          <div className="lg:col-span-1 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-0 group mb-8">
              <img
                src={theme === "dark" ? "/logohaha1.png" : "/logohaha.png"}
                alt="logo"
                className="w-12 h-12 object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <span
                className="font-serif italic text-3xl tracking-tighter ml-[-6px]" 
                style={{ color: activeColor }}
              >
                Veganic
              </span>
            </Link>
            
            <p className="text-gray-500 dark:text-gray-400 font-light italic leading-relaxed mb-10 max-w-[280px] text-sm">
              Nurturing your soul with the purest treasures from mother nature. 100% Organic. 100% Heart.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4 text-[10px] font-bold tracking-[0.2em] text-gray-400 hover:text-[#77cd3af2] transition-all cursor-pointer group uppercase">
                <Mail size={14} style={{ color: activeColor }} />
                <span className="dark:text-gray-400">hello@veganic.com</span>
              </div>
              <div className="flex items-center space-x-4 text-[10px] font-bold tracking-[0.2em] text-gray-400 hover:text-[#77cd3af2] transition-all cursor-pointer group uppercase">
                <MapPin size={14} style={{ color: activeColor }} />
                <span className="dark:text-gray-400">Organic City, Green Valley</span>
              </div>
            </div>
          </div>

          {/* LINKS SECTIONS */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="lg:pt-4"> 
              <h3 className="text-[11px] uppercase tracking-[0.4em] font-bold text-gray-400 dark:text-gray-600 mb-10">
                {title}
              </h3>
              <ul className="space-y-5">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-800 dark:text-gray-400  hover:text-[#77cd3af2] dark:hover:text-[#77cd3af2] transition-all duration-300 text-[15px]  hover:translate-x-2 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* BOTTOM BAR */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-28 pt-12 border-t border-gray-100 dark:border-gray-900/50">
          <div className="flex items-center space-x-8 mb-8 md:mb-0">
            {socialLinks.map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                className="text-gray-400 hover:scale-125 transition-all duration-300 hover:rotate-12"
                style={{ color: 'currentColor' }}
                onMouseEnter={(e) => e.currentTarget.style.color = activeColor}
                onMouseLeave={(e) => e.currentTarget.style.color = 'currentColor'}
              >
                <social.icon size={18} strokeWidth={1.5} />
              </a>
            ))}
          </div>

          <div className="text-center md:text-right">
            <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em] font-semibold">
              © 2026 VEGANIC SANCTUARY. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center justify-center md:justify-end gap-2 mt-3 opacity-30">
                <div className="w-1.5 h-1.5 rounded-full bg-[#77cd3af2] animate-pulse" />
                <p className="text-gray-500 text-[9px] italic font-medium tracking-wider">
                  Handcrafted for a greener lifestyle
                </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;