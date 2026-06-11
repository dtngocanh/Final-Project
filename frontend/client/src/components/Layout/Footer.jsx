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
      
      {/* HIỆU ỨNG LOANG XANH (AURA GRADIENT) */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute -top-32 -left-32 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-[100px] md:blur-[140px] opacity-[0.12] dark:opacity-[0.18]"
          style={{ backgroundColor: activeColor }}
        />
        <div 
          className="absolute -bottom-40 -right-40 w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full blur-[120px] md:blur-[160px] opacity-[0.1] dark:opacity-[0.15]"
          style={{ backgroundColor: activeColor }}
        />
      </div>

      {/* DECOR RAU CỦ TRÔI - Ẩn bớt trên Mobile để tránh đè chữ */}
      <div className="absolute inset-0 pointer-events-none opacity-10 dark:opacity-20 hidden sm:block">
        <motion.div 
          animate={{ y: [0, -25, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 -left-16 md:bottom-24"
        >
          {/* Thu nhỏ size icon trên tablet, phóng to trên desktop */}
          <Carrot className="w-36 h-36 lg:w-56 lg:h-56" strokeWidth={0.15} style={{ color: activeColor }} />
        </motion.div>
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-0 right-[-40px] md:right-[-60px]"
        >
          <Salad className="w-28 h-28 lg:w-44 lg:h-44" strokeWidth={0.15} style={{ color: activeColor }} />
        </motion.div>
      </div>

      {/* CONTAINER CHÍNH */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-12 md:px-16 lg:px-24 py-16 md:py-24">
        
        {/* GRID LINKS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8 lg:gap-16">
          
          {/* BRAND SECTION */}
          <div className="flex flex-col items-start sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-0 group mb-6">
              <img
                src={theme === "dark" ? "/logohaha1.png" : "/logohaha.png"}
                alt="logo"
                className="w-10 h-10 md:w-12 md:h-12 object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <span
                className="font-serif italic text-2xl md:text-3xl tracking-tighter ml-[-6px]" 
                style={{ color: activeColor }}
              >
                Veggies
              </span>
            </Link>
            
            <p className="text-gray-500 dark:text-gray-400 font-light italic leading-relaxed mb-6 max-w-[280px] text-sm">
              Nurturing your soul with the purest treasures from mother nature. 100% Organic. 100% Heart.
            </p>
            
            <div className="space-y-4 w-full break-all">
              <div className="flex items-center space-x-3 text-[10px] font-bold tracking-[0.2em] text-gray-400 hover:text-[#77cd3af2] transition-all cursor-pointer group uppercase">
                <Mail size={14} className="flex-shrink-0" style={{ color: activeColor }} />
                <span className="dark:text-gray-400 truncate">hello@Veggies.com</span>
              </div>
              <div className="flex items-center space-x-3 text-[10px] font-bold tracking-[0.2em] text-gray-400 hover:text-[#77cd3af2] transition-all cursor-pointer group uppercase">
                <MapPin size={14} className="flex-shrink-0" style={{ color: activeColor }} />
                <span className="dark:text-gray-400">Organic City, Green Valley</span>
              </div>
            </div>
          </div>

          {/* LINKS SECTIONS */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="sm:pt-2 lg:pt-4"> 
              <h3 className="text-[11px] uppercase tracking-[0.3em] lg:tracking-[0.4em] font-bold text-gray-400 dark:text-gray-600 mb-6 sm:mb-8">
                {title}
              </h3>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-800 dark:text-gray-400 hover:text-[#77cd3af2] dark:hover:text-[#77cd3af2] transition-all duration-300 text-[14px] md:text-[15px] hover:translate-x-1.5 inline-block"
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
        <div className="flex flex-col sm:flex-row items-center justify-between mt-16 md:mt-24 pt-8 border-t border-gray-100 dark:border-gray-900/50 gap-6 sm:gap-0">
          
          {/* Social Icons */}
          <div className="flex items-center space-x-6 sm:space-x-8">
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

          {/* Copyright text */}
          <div className="text-center sm:text-right">
            <p className="text-gray-400 text-[9px] md:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-semibold">
              © 2026 Veggies SANCTUARY. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center justify-center sm:justify-end gap-2 mt-2 opacity-40">
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