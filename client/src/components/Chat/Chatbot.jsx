import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, X, Send, Loader2, 
  ShoppingCart, ArrowUpRight, CheckCircle2, Cherry
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { sendMessage, addUserMessage } from '../../store/slices/aiSlice';
import { useCartActions } from "../../hooks/useCartActions";

const ChatBot = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [addedItems, setAddedItems] = useState({});

  const { authUser } = useSelector((state) => state.auth);
  const { messages, isAsking } = useSelector((state) => state.ai);
  const { handleCartAction } = useCartActions();

  // Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isAsking]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isAsking) return;
    const userText = input;
    setInput('');
    dispatch(addUserMessage(userText));
    dispatch(sendMessage(userText));
  };

  const onAddToCart = async (p) => {
    const pId = p.id || p._id || p.slug;
    handleCartAction({ ...p, _id: pId }, "ADD", 1);
    setAddedItems(prev => ({ ...prev, [pId]: true }));
    setTimeout(() => setAddedItems(prev => ({ ...prev, [pId]: false })), 2000);
  };

  const goToDetail = (p) => {
    const target = p.slug || p.id || p._id;
    if (target) {
      navigate(`/product/${target}`);
      setIsOpen(false); 
    }
  };

  const firstName = authUser?.fullName ? authUser.fullName.split(' ')[0] : 'there';

  return (
    <div className="fixed bottom-8 right-8 z-[1000] font-fredoka">
      {/* Nút bấm nổi bật/tắt Chatbot */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 z-[1001] relative ${
          isOpen ? 'bg-white text-red-500 rotate-90' : 'bg-[#025c37] text-white'
        } border-4 border-white dark:border-[#1a1a1a]`}
      >
        {isOpen ? <X size={32} /> : <MessageCircle size={32} fill="currentColor" />}
        {!isOpen && (
           <span className="absolute -top-1 -right-1 flex h-4 w-4">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#77cd3a] opacity-75"></span>
             <span className="relative inline-flex rounded-full h-4 w-4 bg-[#77cd3a]"></span>
           </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' }}
          
            className="absolute bottom-20 right-0 w-[calc(100vw-2rem)] md:w-[420px] h-[75vh] max-h-[620px] bg-white/95 dark:bg-[#0b0b0bc7] backdrop-blur-xl rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col border border-white/20 overflow-hidden ring-1 ring-black/5"
          >
            {/* Header: shrink-0 để không bị co khi chat dài */}
            <header className="bg-[#025c37] p-6 text-white relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Cherry size={40} />
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md p-2 border border-white/20 flex items-center justify-center">
                  <img src="/hahahaha.png" alt="Logo" className="w-full h-full object-contain brightness-110" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight leading-none mb-1">Veganic AI</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#77cd3a] rounded-full animate-pulse"></span>
                    <p className="text-[10px] text-green-100/80 uppercase font-medium tracking-[0.2em]">Always Fresh</p>
                  </div>
                </div>
              </div>
            </header>

            {/* Chat Content: flex-1 để tự động giãn nở */}
            <div 
              ref={scrollRef} 
              className="flex-1 p-6 overflow-y-auto space-y-6 scroll-smooth no-scrollbar bg-[#fcfdfc]/50 dark:bg-transparent"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Chào hỏi */}
              <div className="flex flex-col items-start max-w-[85%]">
                <div className="bg-white dark:bg-white/5 p-4 rounded-[24px] rounded-tl-none border border-green-50 shadow-sm">
                  <p className="font-bold text-[#025c37] dark:text-[#77cd3a] mb-1 text-[15px]">Hi {firstName}! 🌿</p>
                  <p className="text-[13.5px] leading-relaxed text-gray-600 dark:text-gray-300">
                    I'm your organic expert. Ready to find something healthy and delicious?
                  </p>
                </div>
              </div>

              {/* Danh sách tin nhắn */}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-3`}>
                  <div className={`p-4 px-5 rounded-[24px] text-[13.5px] leading-relaxed max-w-[85%] shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-[#025c37] text-white rounded-tr-none' 
                    : 'bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-tl-none text-gray-700 dark:text-gray-200'
                  }`}>
                    {msg.content}
                  </div>

                  {/* Hiển thị sản phẩm gợi ý */}
                  {msg.role === 'bot' && msg.products?.length > 0 && (
                    <div className="flex gap-4 overflow-x-auto w-full pb-4 px-1 no-scrollbar snap-x">
                      {msg.products.map((p) => {
                        const pId = p.id || p._id || p.slug;
                        const isAdded = addedItems[pId];

                        return (
                          <motion.div 
                            key={pId}
                            whileHover={{ y: -5 }}
                            className="min-w-[220px] bg-white dark:bg-[#161616] border border-gray-100 dark:border-white/10 rounded-[32px] overflow-hidden shadow-lg snap-center"
                          >
                            <div className="relative h-36 bg-gray-50/50 dark:bg-white/5 p-4 cursor-pointer group" onClick={() => goToDetail(p)}>
                              <img src={p.image} className="w-full h-full object-contain group-hover:scale-110 transition-all duration-700" alt={p.name} />
                              <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                <ArrowUpRight size={14} className="text-[#025c37]" />
                              </div>
                            </div>

                            <div className="p-4 space-y-3">
                              <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-500 truncate">{p.name}</h4>
                              <div className="flex justify-between items-end">
                                <p className="text-xl font-serif text-[#025c37] dark:text-[#77cd3a]">${p.price}</p>
                                <span className="text-[8px] bg-green-50 dark:bg-green-900/20 text-[#025c37] dark:text-[#77cd3a] px-2 py-1 rounded-full font-bold uppercase">Organic</span>
                              </div>

                              <button 
                                onClick={() => onAddToCart(p)}
                                className={`w-full py-2.5 rounded-[14px] flex items-center justify-center gap-2 transition-all active:scale-95 font-bold uppercase text-[10px] tracking-widest ${
                                  isAdded ? 'bg-green-600 text-white shadow-md' : 'bg-[#77cd3a] text-black hover:bg-[#66b32f]'
                                }`}
                              >
                                {isAdded ? <CheckCircle2 size={14} /> : <ShoppingCart size={14} />}
                                <span>{isAdded ? "In Cart" : "Add to Cart"}</span>
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* Hiệu ứng loading */}
              {isAsking && (
                <div className="flex items-center gap-3 bg-white/80 dark:bg-white/5 p-4 rounded-[20px] border border-green-50 w-fit shadow-sm">
                  <Loader2 size={18} className="animate-spin text-[#77cd3a]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#025c37] dark:text-gray-400">Harvesting data...</span>
                </div>
              )}
            </div>

            {/* Input Footer: shrink-0 để cố định vị trí */}
            <footer className="p-5 bg-white dark:bg-[#0b0b0b] border-t border-gray-100 dark:border-white/5 shrink-0">
              <form onSubmit={handleSend} className="flex items-center gap-3 bg-gray-100/50 dark:bg-white/5 rounded-[22px] px-5 py-1.5 ring-1 ring-black/5 focus-within:ring-[#77cd3a]/40 transition-all shadow-inner">
                <input
                  type="text"
                  placeholder="Ask about organic food..."
                  className="flex-1 bg-transparent py-3 text-[14px] outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isAsking}
                />
                <button 
                  type="submit" 
                  disabled={isAsking || !input.trim()} 
                  className="w-10 h-10 rounded-full bg-[#025c37] text-white flex items-center justify-center disabled:opacity-20 hover:scale-105 active:scale-90 transition-all shadow-md"
                >
                  <Send size={18} />
                </button>
              </form>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBot;