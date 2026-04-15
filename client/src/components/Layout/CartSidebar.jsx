import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toggleCart } from "../../store/slices/popupSlice";
import { useCartActions } from "../../hooks/useCartActions";
const CartSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isCartOpen } = useSelector((state) => state.popup);
  const { cart } = useSelector((state) => state.cart);     // 1. Lấy giỏ hàng hiện tại từ Redux

  const { theme } = useSelector((state) => state.auth);

  const activeColor = "#77cd3af2";

  const handleClose = () => dispatch(toggleCart());

  const { handleCartAction } = useCartActions();


  const total = cart?.reduce(
    (sum, item) => sum + item?.product.price * item?.quantity,
    0
  ) || 0;


  if (!isCartOpen) return null;

  return (
    <>
      {/* OVERLAY: Đồng bộ với Sidebar Menu */}
      <div
        className="fixed inset-0 bg-white/40 dark:bg-gray-950/60 z-[100]  transition-all duration-500 animate-in fade-in"
        onClick={handleClose}
      />

      {/* CART SIDEBAR: Trượt từ bên PHẢI */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-[400px] md:max-w-[450px] z-[110] bg-white/95 dark:bg-[#050505]/95 backdrop-blur-2xl shadow-[-50px_0_100px_-20px_rgba(0,0,0,0.2)] flex flex-col transition-all duration-500 ease-in-out animate-in slide-in-from-right">

        {/* HEADER: Close Button & Title */}
        <div className="p-8 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <ShoppingBag size={22} style={{ color: activeColor }} />
            <h2 className="text-2xl font-light dark:text-white">
              My <span className="font-serif italic border-b border-[#77cd3af2]/30">Cart</span>
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-red-500 transition-all duration-300 hover:rotate-90"
          >
            <X size={28} strokeWidth={1} />
          </button>
        </div>

        {/* LIST ITEMS: Cuộn mượt mà */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 scrollbar-hide">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={item._id} className="group relative flex gap-6 items-start animate-in fade-in slide-in-from-bottom-2">
                {/* Product Image */}
                <div className="w-24 h-24 rounded-2xl bg-gray-50 dark:bg-white/5 overflow-hidden flex-shrink-0 border border-gray-100 dark:border-white/10">
                  <img src={item.product.images?.[0]?.url} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-1">
                  <h3 className="font-medium text-gray-900 dark:text-white text-lg truncate">{item.product.name}</h3>
                  <p className="text-sm text-gray-400 italic font-serif">Freshly picked</p>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-full px-2 py-1 gap-4">
                      <button onClick={() => handleCartAction(item.product, "UPDATE_QTY", -1)} className="p-1 hover:text-[#77cd3af2] transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium dark:text-white w-4 text-center">{item.quantity}</span>
                      <button onClick={() => handleCartAction(item.product, "UPDATE_QTY", 1)} className="p-1 hover:text-[#77cd3af2] transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-bold dark:text-white">${(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleCartAction(item.product, "REMOVE")}
                  className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                >
                  <Trash2 size={18} strokeWidth={1.5} />
                </button>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-dashed border-gray-200 dark:border-white/10">
                <ShoppingBag size={30} opacity={0.3} />
              </div>
              <p className="italic font-serif">Your cart is feeling a bit empty...</p>
            </div>
          )}
        </div>

        {/* FOOTER: Tổng tiền & Thanh toán */}
        <div className="p-8 pt-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="flex justify-between items-end mb-8">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-bold">Subtotal</p>
              <p className="text-xs italic text-[#77cd3af2]">Taxes and shipping calculated at checkout</p>
            </div>
            <p className="text-3xl font-light dark:text-white">${total.toLocaleString()}</p>
          </div>

          <button onClick={() => {
            handleClose();
            navigate("/checkout", { state: { subtotal: total } })
          }} className="relative w-full group overflow-hidden rounded-2xl bg-black dark:bg-[#77cd3af2] py-5 transition-all hover:scale-[1.02] active:scale-95">
            <div className="relative z-10 flex items-center justify-center gap-3 text-white dark:text-black font-bold tracking-widest text-xs uppercase">
              <span>Continue to checkout</span>
            </div>
            {/* Hiệu ứng loang cho button */}
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default CartSidebar;