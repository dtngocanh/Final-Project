import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  ShoppingCart,
  Leaf,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { sendMessage, addUserMessage } from "../../store/slices/aiSlice";
import FruitLoader from "../Fruit/FruitLoader";
import FruitChat from "../Fruit/FruitChat";
import { addToCartThunk } from "../../store/slices/cartSlice";
import { toast } from "react-toastify";

const ChatBot = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // LẤY DỮ LIỆU TỪ REDUX GIỐNG PROFILE PANEL
  const { messages, isAsking } = useSelector((state) => state.ai);
  const { authUser } = useSelector((state) => state.auth);

  // Lấy tên, nếu chưa đăng nhập thì để là "Guest"
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
    <div className="fixed bottom-6 right-6 z-[1000] font-fredoka">
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-[#025c37] to-[#038550] text-white flex items-center justify-center shadow-[0_10px_25px_rgba(2,92,55,0.3)]"
      >
        {isOpen ? <X size={30} /> : <MessageCircle size={30} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: 50,
              scale: 0.9,
              transformOrigin: "bottom right",
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-[380px] h-[550px] bg-white rounded-[35px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header with Veggies Logo */}
            <header className="bg-[#025c37] p-5 text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
                <img src="/hahahaha.png" className="size-[24px]" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">
                  Veggies Mart
                </h3>
                <p className="text-[10px] text-green-200 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online Support
                </p>
              </div>
            </header>

            {/* Chat Content */}
            <div
              ref={scrollRef}
              className="flex-1 p-5 overflow-y-auto space-y-6 bg-[#f8faf9] no-scrollbar"
            >
              {/* English Greeting using authUser Name */}
              <div className="flex flex-col items-start">
                <div className="p-4 rounded-[22px] rounded-tl-none text-sm bg-white border border-green-100 text-gray-700 shadow-sm leading-relaxed">
                  Hi <b>{displayName}</b>! <br />
                  Welcome to Veggies Mart. How can I help you find fresh
                  products today?
                </div>
              </div>

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`p-3.5 rounded-[22px] text-sm max-w-[85%] shadow-sm ${
                      msg.role === "user"
                        ? "bg-[#025c37] text-white rounded-tr-none"
                        : "bg-white border border-gray-100 text-gray-700 rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </motion.div>

                  {/* Product Carousel Cards */}
                  {msg.role === "bot" && msg.products?.length > 0 && (
                    <div className="flex gap-4 overflow-x-auto w-full py-4 no-scrollbar snap-x mt-2">
                      {msg.products.map((p) => (
                        <motion.div
                          key={p.id}
                          whileHover={{ y: -5 }}
                          className="min-w-[200px] bg-white border border-gray-100 rounded-[30px] overflow-hidden shadow-lg snap-center"
                        >
                          <div
                            className="h-32 bg-white p-3 flex items-center justify-center cursor-pointer"
                            onClick={() => navigate(`/product/${p.id}`)}
                          >
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-contain mix-blend-multiply"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/150?text=Veggies";
                              }}
                            />
                          </div>
                          <div className="p-4 bg-gray-50/50 border-t border-gray-50">
                            <h4 className="text-[10px] font-bold uppercase truncate text-gray-400 mb-1">
                              {p.name}
                            </h4>
                            <p className="text-xl font-black text-[#025c37] mb-3">
                              ${p.price}
                            </p>
                            <button
                              onClick={
                                () =>
                                  dispatch(
                                    addToCartThunk({
                                      productId: p._id,
                                      quantity: 1,
                                    }),
                                  )
                                    .unwrap()
                                    .then((response) => {
                                      toast.success(
                                        `Added ${p.name} to cart!`,
                                        {
                                          toastId: `add-success-${p._id}`,
                                        },
                                      );
                                    })
                                    .catch((error) => {
                                      toast.error(
                                        error ||
                                          "Failed to add product to cart!",
                                      );
                                    })
                                // handleCartAction({ ...p, _id: p.id }, "ADD", 1)
                              }
                              className="w-full py-2.5 rounded-2xl bg-[#77cd3a] text-[#025c37] text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-[#66b132] transition-all shadow-sm active:scale-95"
                            >
                              <ShoppingCart size={14} /> ADD TO CART
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isAsking && (
                <div className="flex items-center gap-2 text-[#025c37] bg-white border border-green-50 w-fit px-4 py-2 rounded-full text-xs font-medium shadow-sm">
                  <FruitChat />
                </div>
              )}
            </div>

            {/* Input Footer */}
            <footer className="p-4 bg-white border-t border-gray-100">
              <form
                onSubmit={handleSend}
                className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#025c37]/10 transition-all"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me about organic food..."
                  className="flex-1 bg-transparent py-2.5 text-sm outline-none text-gray-700"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isAsking}
                  className="text-[#025c37] p-2 hover:bg-green-50 rounded-full transition-colors disabled:opacity-30"
                >
                  <Send size={20} />
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
