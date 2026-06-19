import React from 'react';

const PantryItem = ({ item, onSuggest }) => {
  // Expiry date calculation logic
  const calculateStatus = (addedAt, shelfLifeDays) => {
    const addedDate = new Date(addedAt);
    const expiryDate = new Date(addedDate);
    expiryDate.setDate(expiryDate.getDate() + shelfLifeDays);
    
    const today = new Date();
    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Expired', status: 'EXPIRED' };
    if (diffDays <= 3) return { label: `${diffDays} days left`, status: 'EXPIRING' };
    return { label: `${diffDays} days left`, status: 'GOOD' };
  };

  const status = calculateStatus(item.addedAt, item.shelfLifeDays);

  // Dynamic styles based on fridge item status
  const cardStyles = {
    EXPIRED: 'border-red-200 bg-gradient-to-br from-red-50/70 to-red-100/40 opacity-75 shadow-sm',
    EXPIRING: 'border-amber-200 bg-gradient-to-br from-white via-amber-50/20 to-orange-50/30 shadow-md shadow-amber-100/50 hover:shadow-amber-200/60 animate-[pulse_3s_infinite]',
    GOOD: 'border-slate-100 bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/20 shadow-md shadow-slate-100/80 hover:shadow-emerald-100/50'
  };

  const badgeStyles = {
    EXPIRED: 'bg-red-100 text-red-700 border-red-200',
    EXPIRING: 'bg-amber-100 text-amber-700 border-amber-200',
    GOOD: 'bg-emerald-50 text-emerald-700 border-emerald-100'
  };

  const dotStyles = {
    EXPIRED: 'bg-red-500',
    EXPIRING: 'bg-amber-500 animate-ping',
    GOOD: 'bg-emerald-500'
  };

  return (
    <div className={`group relative p-4 rounded-2xl border flex flex-col items-center text-center justify-between transition-all duration-300 hover:-translate-y-1.5 ${cardStyles[status.status]}`}>
      
      {/* VIRTUAL FRIDGE GLASS SHELF */}
      <div className="relative w-20 h-20 mb-3 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200/60 flex items-center justify-center p-1 shadow-inner group-hover:scale-105 transition-transform duration-300">
        <img 
          src={item.image || "https://via.placeholder.com/150"} 
          className={`w-full h-full rounded-xl object-cover shadow-sm transition-all duration-300
            ${status.status === 'EXPIRED' ? 'grayscale contrast-75 brightness-90 opacity-60' : 'group-hover:rotate-2'}`} 
          alt={item.name} 
        />
        
        {/* Frosty gloss overlay for a chilly fridge effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-white/30 rounded-xl pointer-events-none" />
      </div>

      {/* ITEM DETAILS */}
      <div className="flex-1 flex flex-col items-center w-full">
        <h4 className="font-black text-sm text-slate-700 tracking-tight line-clamp-1 group-hover:text-emerald-600 transition-colors duration-200">
          {item.name}
        </h4>
        
        {/* LOCALIZED EXPIRY BADGE (NO ICONS) */}
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border my-2.5 tracking-wide uppercase shadow-2xs ${badgeStyles[status.status]}`}>
          {/* Vẫn giữ chấm tròn màu động nhỏ xíu để phân biệt trạng thái cực mượt */}
          <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[status.status]}`} />
          {status.label}
        </span>
      </div>

      {/* ACTION CONTROLS */}
      <div className="w-full mt-1">
        {status.status !== 'EXPIRED' ? (
          <button 
            onClick={() => onSuggest(item)}
            className="w-full py-2 px-4 bg-gradient-to-r from-emerald-500 to-[#77cd3a] hover:from-emerald-600 hover:to-[#66b330] text-white rounded-xl text-xs font-black tracking-wide shadow-[0_4px_10px_rgba(119,205,58,0.25)] hover:shadow-[0_6px_14px_rgba(119,205,58,0.4)] active:scale-95 transition-all duration-200"
          >
            Suggest Recipes
          </button>
        ) : (
          <div className="w-full py-2 text-center text-[10px] text-red-400 font-bold border border-dashed border-red-200 rounded-xl bg-red-50/20 select-none">
            Time to clear it out!
          </div>
        )}
      </div>
    </div>
  );
};

export default PantryItem;