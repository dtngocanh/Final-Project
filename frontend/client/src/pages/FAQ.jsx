import { useState } from 'react';
import { ChevronDown, Leaf, Carrot, Salad, Citrus, Cherry, HelpCircle } from 'lucide-react';
import { useTheme } from "../contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const FAQ = () => {
  const { theme } = useTheme();
  const activeColor = theme === "dark" ? "#77cd3af2" : "#025c37";
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How do I place an order?',
      answer: 'Simply browse our products, add items to your cart, and proceed to checkout. Follow the prompts to complete your order.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and other secure payment methods.'
    },
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 3-5 business days. Express shipping options are available at checkout.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for most items. Items must be in original condition with tags attached.'
    }
  ];

  // Danh sách rau củ quả decor chuẩn style About/Contact
  const vegies = [
    { Icon: Carrot, size: 110, top: '10%', left: '8%', delay: 0, rotate: 15 },
    { Icon: Salad, size: 150, top: '55%', right: '12%', delay: 2, rotate: -20 },
    { Icon: Citrus, size: 90, bottom: '15%', left: '10%', delay: 4, rotate: 45 },
    { Icon: Cherry, size: 70, top: '15%', right: '20%', delay: 1, rotate: -10 },
  ];

  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-950 overflow-hidden transition-colors duration-500 pt-24 pb-32">
      
      {/* BACKGROUND DECOR: Rau củ & Glow loang lổ */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] bg-[#77cd3af2]/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] bg-[#025c37]/5 dark:bg-[#77cd3af2]/5 blur-[150px] rounded-full" />

        {vegies.map((item, index) => (
          <motion.div
            key={index}
            style={{ position: 'absolute', top: item.top, left: item.left, right: item.right, bottom: item.bottom }}
            animate={{ 
              y: [0, 35, 0],
              rotate: [item.rotate, item.rotate + 15, item.rotate],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 10 + index * 2, repeat: Infinity, ease: "easeInOut", delay: item.delay }}
          >
            <item.Icon size={item.size} strokeWidth={0.5} style={{ color: activeColor }} />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle size={20} style={{ color: activeColor }} />
            <span className="uppercase tracking-[0.3em] text-[10px] font-bold opacity-60 dark:text-gray-400">Support Center</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-gray-900 dark:text-white leading-tight">
            Frequently <br />
            <span className="font-serif italic text-[#77cd3af2]">Asked Questions</span>
          </h1>
        </motion.div>

        {/* FAQ LIST */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-[2rem] border border-gray-100 dark:border-gray-800/50 shadow-sm hover:shadow-xl hover:border-[#77cd3af2]/30 transition-all duration-500 overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-8 py-7 text-left flex items-center justify-between"
                >
                  <h3 className="text-lg font-light tracking-wide text-gray-800 dark:text-gray-200 group-hover:text-[#77cd3af2] transition-colors leading-snug">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ChevronDown size={22} strokeWidth={1.5} style={{ color: activeColor }} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-8 pb-8">
                        <div className="w-12 h-[1px] bg-[#77cd3af2]/40 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-light italic leading-relaxed text-lg">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* BOTTOM DECOR */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-24 text-center"
        >
          <p className="text-gray-400 dark:text-gray-500 font-light italic">
            Still have questions? <span className="text-[#77cd3af2] cursor-pointer border-b border-[#77cd3af2]/20 hover:border-[#77cd3af2]">Contact our soul team.</span>
          </p>
        </motion.div>

      </div>
    </div>
  );
};

export default FAQ;