import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { sendMessage, addUserMessage } from "../../store/slices/aiSlice";
import FruitChat from "../Fruit/FruitChat";
import { addToCartThunk } from "../../store/slices/cartSlice";
import { toast } from "react-toastify";

const ChatBot = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { messages, isAsking } = useSelector((state) => state.ai);
  const { authUser } = useSelector((state) => state.auth);
  const displayName = authUser?.name || "Guest";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isAsking]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isAsking) return;
    dispatch(addUserMessage(input));
    dispatch(sendMessage(input));
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1000] font-fredoka">
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#025c37] to-[#038550] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(2,92,55,0.3)]"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed inset-x-2 bottom-20 sm:absolute sm:inset-auto sm:bottom-20 sm:right-0 
                       w-[calc(100vw-16px)] sm:w-[380px] h-[70vh] sm:h-[550px] 
                       bg-white rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden"
          >
            {/* Header - Không viền */}
            <header className="bg-[#025c37] p-5 text-white flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                <img src="/hahahaha.png" alt="logo" className="size-6 object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base">Veggies Mart</h3>
                <p className="text-[10px] text-green-200/80 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Always Active
                </p>
              </div>
            </header>

            {/* Chat Content */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-5 bg-[#fbfdfb] no-scrollbar">
              <div className="p-4 rounded-[24px] rounded-tl-none text-sm bg-white shadow-sm text-gray-700 leading-relaxed">
                Hi <b>{displayName}</b>! Welcome to Veggies Mart. How can I help you find fresh products today?
              </div>

              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3.5 rounded-[20px] text-sm max-w-[85%] shadow-sm ${
                      msg.role === "user" ? "bg-[#025c37] text-white rounded-tr-none" : "bg-white text-gray-700 rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </motion.div>

                  {/* Product Carousel */}
                  {msg.role === "bot" && msg.products?.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto w-full py-4 no-scrollbar">
                      {msg.products.map((p) => (
                        <div key={p.id} className="min-w-[160px] bg-white rounded-[24px] overflow-hidden shadow-md">
                          <div className="h-28 bg-white p-2 flex items-center justify-center cursor-pointer" onClick={() => navigate(`/product/${p.id}`)}>
                            <img src={p.image} alt={p.name} className="h-full object-contain mix-blend-multiply" />
                          </div>
                          <div className="p-3 bg-white">
                            <h4 className="text-[9px] font-bold uppercase text-gray-400 truncate">{p.name}</h4>
                            <p className="text-lg font-black text-[#025c37] mb-2">${p.price}</p>
                            <button 
                              onClick={() => dispatch(addToCartThunk({ productId: p._id, quantity: 1 })).unwrap().then(() => toast.success("Added!"))}
                              className="w-full py-2 rounded-xl bg-[#e8f5e9] text-[#025c37] text-[10px] font-bold hover:bg-[#c8e6c9] transition-colors"
                            >
                              ADD TO CART
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isAsking && <div className="text-[#025c37] px-4"><FruitChat /></div>}
            </div>

            {/* Input Footer - Không viền */}
            <footer className="p-4 bg-white shrink-0">
              <form onSubmit={handleSend} className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-1.5 focus-within:ring-2 ring-[#025c37]/10 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask something..."
                  className="flex-1 bg-transparent py-2 text-sm outline-none text-gray-700 placeholder:text-gray-400"
                />
                <button type="submit" className="text-[#025c37] hover:text-[#038550] transition-colors">
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