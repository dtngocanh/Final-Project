import { useState } from "react";
import { Mail, Phone, MapPin, Send, Leaf, Carrot, Salad, Citrus, Cherry } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";

const Contact = () => {
  const { theme } = useTheme();
  const activeColor = theme === "dark" ? "#77cd3af2" : "#025c37";
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const vegies = [
    { Icon: Carrot, size: 100, top: '15%', left: '10%', delay: 0, rotate: 20 },
    { Icon: Salad, size: 140, top: '50%', right: '8%', delay: 2, rotate: -15 },
    { Icon: Citrus, size: 90, bottom: '20%', left: '5%', delay: 4, rotate: 30 },
    { Icon: Cherry, size: 70, top: '10%', right: '20%', delay: 1, rotate: -10 },
    { Icon: Leaf, size: 120, bottom: '10%', right: '25%', delay: 3, rotate: 15 },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent successfully!");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-950 overflow-hidden transition-colors duration-500 pt-24 pb-32">
      
      {/* BACKGROUND DECOR: Rau củ & Glow mờ ảo */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Glow loang màu chuẩn Search Modal */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#77cd3af2]/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[700px] h-[700px] bg-[#025c37]/5 dark:bg-[#77cd3af2]/5 blur-[150px] rounded-full" />

        {/* Rau củ trôi nổi dập dìu */}
        {vegies.map((item, index) => (
          <motion.div
            key={index}
            style={{ position: 'absolute', top: item.top, left: item.left, right: item.right, bottom: item.bottom }}
            animate={{ 
              y: [0, 30, 0],
              rotate: [item.rotate, item.rotate + 15, item.rotate],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 12 + index * 2, repeat: Infinity, ease: "easeInOut", delay: item.delay }}
          >
            <item.Icon size={item.size} strokeWidth={0.5} style={{ color: activeColor }} />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            {/* <Leaf size={20} style={{ color: activeColor }} /> */}
            <img src="/hahahaha.png" alt="" style={{ color: activeColor }}/>
            <span className="uppercase tracking-[0.3em] text-[10px] font-bold opacity-60 dark:text-gray-400">Get in touch</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-gray-900 dark:text-white">
            Contact <span className="font-serif italic text-[#77cd3af2]">Veganic</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* CONTACT INFO: Style tối giản, mờ ảo */}
          <div className="space-y-12">
            {[
              { icon: Mail, label: "Email", value: "hello@veganic.com" },
              { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
              { icon: MapPin, label: "Address", value: "123 Organic Lane, Green City, ST 12345" }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="flex items-center space-x-6 group"
              >
                <div className="w-16 h-16 rounded-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-100 dark:border-gray-800 flex items-center justify-center shadow-lg group-hover:border-[#77cd3af2]/50 transition-all duration-500">
                  <item.icon className="w-6 h-6" style={{ color: activeColor }} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">{item.label}</h3>
                  <p className="text-xl font-light text-gray-800 dark:text-gray-200">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CONTACT FORM: Lớp kính Backdrop Blur cực mạnh */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] border border-white/40 dark:border-white/5 shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-0 py-4 bg-transparent border-b border-gray-200 dark:border-gray-800 focus:outline-none focus:border-[#77cd3af2] transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 font-light"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-0 py-4 bg-transparent border-b border-gray-200 dark:border-gray-800 focus:outline-none focus:border-[#77cd3af2] transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 font-light"
                    required
                  />
                </div>
              </div>

              <input
                type="text"
                placeholder="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-0 py-4 bg-transparent border-b border-gray-200 dark:border-gray-800 focus:outline-none focus:border-[#77cd3af2] transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 font-light"
                required
              />

              <textarea
                rows="4"
                placeholder="How can we help you?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-0 py-4 bg-transparent border-b border-gray-200 dark:border-gray-800 focus:outline-none focus:border-[#77cd3af2] transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 font-light resize-none"
                required
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                style={{ backgroundColor: activeColor }}
                className="w-full text-white py-5 rounded-2xl font-bold tracking-widest uppercase text-xs flex items-center justify-center space-x-3 shadow-xl shadow-[#77cd3af2]/20 hover:opacity-90 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </motion.button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Contact;