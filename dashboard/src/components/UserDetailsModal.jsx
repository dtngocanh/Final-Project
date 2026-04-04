import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, X, MapPin } from "lucide-react";

const UserDetailsModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-['Fredoka']">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white/90 backdrop-blur-xl w-full max-w-2xl rounded-[40px] shadow-2xl border border-white overflow-hidden"
        >
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10 text-gray-400">
            <X size={20} />
          </button>

          <div className="p-8">
            <div className="flex items-center gap-6 mb-8 border-b border-gray-50 pb-8">
              <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-[#77cd3a1a] to-[#77cd3a05] flex items-center justify-center text-[#77cd3af2] font-black text-3xl border border-[#77cd3a1a]">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">{user.name}</h2>
                <div className="flex gap-2 mt-1">
                  <span className="px-3 py-1 rounded-full bg-green-50 text-[#77cd3af2] text-[9px] font-black uppercase tracking-widest border border-green-100">
                    {user.role}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-300 text-[9px] font-black uppercase tracking-widest border border-gray-100 italic">
                    ID: {user._id?.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white/50 p-6 rounded-[30px] border border-white shadow-sm space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <Mail size={16} className="text-[#77cd3af2]" /> {user.email}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <Phone size={16} className="text-[#77cd3af2]" /> {user.phone}
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-400 font-medium italic">
                  <MapPin size={16} className="text-[#77cd3af2] mt-0.5 shrink-0" /> 
                  <span className="leading-relaxed">{user.address}</span>
                </div>
              </div>

              <div className="bg-[#77cd3a]/5 p-6 rounded-[30px] border border-[#77cd3a1a] flex flex-col justify-center items-center text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Lifetime Spent</p>
                <p className="text-4xl font-black text-[#77cd3af2]">${user.totalSpent?.toFixed(2)}</p>
                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest italic">Joined {user.createdAt}</p>
              </div>
            </div>

            
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UserDetailsModal;