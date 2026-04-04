import React from "react";
import { useDispatch } from "react-redux";
import { toggleViewProductModal } from "../store/slices/extraSlice";
import { 
  X, Calendar, Tag, Box, Star, 
  Info, DollarSign, Layers, ShieldCheck 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FloatingVegetables from "../components/Fruit/FloatingVegetables";

const ViewProductModal = ({ selectedProduct }) => {
  const dispatch = useDispatch();

  if (!selectedProduct) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 font-['Fredoka']">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => dispatch(toggleViewProductModal())}
          className="absolute inset-0 bg-white/40 backdrop-blur-md"
        />

        {/* Trái cây bay lơ lửng xung quanh */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <FloatingVegetables activeColor="#77cd3af2" />
        </div>

        {/* Modal chính */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          className="relative bg-white/90 backdrop-blur-2xl w-full max-w-4xl rounded-[50px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-white overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header & Close */}
          <div className="p-8 pb-0 flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#77cd3a1a] rounded-2xl text-[#77cd3af2]">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Product Inspection</p>
                <h2 className="text-2xl font-bold text-gray-800">{selectedProduct.name || selectedProduct.title}</h2>
              </div>
            </div>
            <button
              onClick={() => dispatch(toggleViewProductModal())}
              className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left Side: Image Gallery */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {selectedProduct.images?.map((img, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      className={`relative rounded-[30px] overflow-hidden border-4 border-white shadow-sm ${
                        idx === 0 ? "col-span-2 h-64" : "h-32"
                      }`}
                    >
                      <img
                        src={img?.url}
                        alt={`Fresh ${idx}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                  {(!selectedProduct.images || selectedProduct.images.length === 0) && (
                    <div className="col-span-2 h-64 bg-gray-50 rounded-[30px] flex items-center justify-center text-gray-300 italic text-sm">
                      No images available
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Detailed Info */}
              <div className="space-y-6">
                {/* Price & Stock Badge */}
                <div className="flex items-center justify-between bg-white/50 p-6 rounded-[35px] border border-white">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Market Price</p>
                    <div className="flex items-center text-3xl font-black text-[#77cd3af2]">
                      <DollarSign size={24} />
                      <span>{selectedProduct.price?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-tighter border ${
                    selectedProduct.stock > 0 
                      ? "bg-green-50 text-green-600 border-green-100" 
                      : "bg-red-50 text-red-500 border-red-100"
                  }`}>
                    {selectedProduct.stock > 0 ? `IN STOCK (${selectedProduct.stock})` : "OUT OF STOCK"}
                  </div>
                </div>

                {/* Attributes Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50/50 p-4 rounded-[25px] flex items-center gap-3">
                    <Tag className="text-[#77cd3af2]" size={18} />
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">{selectedProduct.category}</span>
                  </div>
                  <div className="bg-gray-50/50 p-4 rounded-[25px] flex items-center gap-3">
                    <Star className="text-yellow-400 fill-yellow-400" size={18} />
                    <span className="text-xs font-bold text-gray-600">{selectedProduct.ratings || 0} / 5.0</span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Info size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Product Story</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed italic">
                    {selectedProduct.description || "No description provided for this organic product."}
                  </p>
                </div>

                {/* Metadata */}
                <div className="pt-6 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-medium text-gray-400 italic">
                    <span className="flex items-center gap-2"><Box size={14}/> ID: {selectedProduct._id || selectedProduct.id}</span>
                    <span className="flex items-center gap-2">
                      <Calendar size={14}/> 
                      Added: {selectedProduct.created_at ? new Date(selectedProduct.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Action Footer */}
                <button 
                  onClick={() => dispatch(toggleViewProductModal())}
                  className="w-full py-4 bg-gray-900 text-white rounded-[25px] font-bold text-sm hover:bg-black transition-all active:scale-95 shadow-xl"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ViewProductModal;