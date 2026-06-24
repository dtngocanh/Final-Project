import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toggleCart } from "../../store/slices/popupSlice";
import {
  removeFromCartThunk,
  updateQtyThunk,
} from "../../store/slices/cartSlice";

const CartSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isCartOpen } = useSelector((state) => state.popup);
  const { cart = [], totalCart } = useSelector((state) => state.cart);

  const activeColor = "#77cd3af2";

  const handleClose = () => dispatch(toggleCart());

  // 1. TÍNH TOÁN GIÁ TRỊ TỔNG ĐƠN HÀNG CHUẨN XÁC
  const originalTotal =
    cart?.reduce(
      (sum, item) => sum + (item?.product?.price || 0) * item?.quantity,
      0,
    ) || 0;

  const actualTotal = totalCart > 0 ? totalCart : originalTotal;

  if (!isCartOpen) return null;

  return (
    <>
      {/* OVERLAY: Đồng bộ với Sidebar Menu */}
      <div
        className="fixed inset-0 bg-white/40 dark:bg-gray-950/60 z-[100] transition-all duration-500 animate-in fade-in"
        onClick={handleClose}
      />

      {/* CART SIDEBAR: Tối ưu Responsive
          - Chiếm 100% chiều rộng trên điện thoại nhỏ (w-full)
          - Giới hạn chiều rộng tăng dần trên các thiết bị lớn hơn (xs, sm, md) nhằm giữ độ sang trọng
          - Đổ bóng nhẹ hơn trên mobile để tránh rác màn hình
      */}
      <aside className="fixed right-0 top-0 h-full w-full xs:max-w-[380px] sm:max-w-[420px] md:max-w-[450px] z-[110] bg-white/95 dark:bg-[#050505]/95 backdrop-blur-2xl shadow-[-30px_0_60px_-15px_rgba(0,0,0,0.15)] md:shadow-[-50px_0_100px_-20px_rgba(0,0,0,0.2)] flex flex-col transition-all duration-500 ease-in-out animate-in slide-in-from-right">
        {/* HEADER: Điều chỉnh linh hoạt Padding và Size chữ từ Mobile đến Desktop */}
        <div className="p-5 sm:p-6 md:p-8 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2 sm:gap-3">
            <ShoppingBag
              size={20}
              className="md:w-[22px] md:h-[22px]"
              style={{ color: activeColor }}
            />
            <h2 className="text-xl md:text-2xl font-light dark:text-white">
              My{" "}
              <span className="font-serif italic border-b border-[#77cd3af2]/30">
                Cart
              </span>
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-red-500 transition-all duration-300 hover:rotate-90"
          >
            <X size={24} className="md:w-7 md:h-7" strokeWidth={1.5} />
          </button>
        </div>

        {/* LIST ITEMS: Điều chỉnh khoảng cách cuộn tùy theo màn hình */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 md:px-8 py-4 md:py-6 space-y-6 md:space-y-8 scrollbar-hide">
          {cart.length > 0 ? (
            cart.map((item) => {
              const product = item?.product || {};
              const isComboItem = item.price && item.price < product.price;
              const displayPrice = item.price || product.price || 0;

              return (
                <div
                  key={item._id}
                  className={`group relative flex gap-4 sm:gap-6 items-start animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-2xl p-2 transition-all
                    ${
                      product.stock === 0
                        ? "bg-gray-100 dark:bg-red-950/10 opacity-75"
                        : ""
                    }`}
                >
                  {/* Product Image: Giảm kích thước xuống w-20 trên mobile nhỏ để nhường chỗ cho text */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-50 dark:bg-white/5 overflow-hidden flex-shrink-0 border border-gray-100 dark:border-white/10">
                    <img
                      src={product.images?.[0]?.url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Details: Sử dụng min-w-0 và truncate để chống tràn chữ khi tên sản phẩm quá dài */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate pr-6 sm:pr-8">
                      {product.name}
                    </h3>

                    {/* Tags & Price */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isComboItem ? (
                        <span className="text-[8px] font-bold bg-[#77cd3a]/10 text-[#77cd3a] px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Combo
                        </span>
                      ) : (
                        <span className="text-[8px] font-bold bg-gray-100 dark:bg-white/5 text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Item
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        ${displayPrice}
                      </span>
                      {isComboItem && (
                        <span className="text-[10px] text-gray-400/40 line-through">
                          ${product.price}
                        </span>
                      )}
                      {product.stock === 0 ? (
                        <p className="text-[9px] text-red-500 font-bold tracking-wider uppercase bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-md w-max mt-2">
                          Out of stock · Remove this item
                        </p>
                      ) : product.stock <= 5 ? (
                        <p className="text-[9px] text-red-500 font-bold tracking-wider uppercase bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-md w-max mt-2 animate-pulse">
                          Only {product.stock} left
                        </p>
                      ) : null}
                    </div>

                    {/* Bộ điều khiển số lượng và giá tổng của Item */}
                    <div className="flex items-center justify-between mt-3 sm:mt-4 gap-2">
                      {/* Quantity Selector: Thu nhỏ khoảng cách padding trên điện thoại cực bé */}
                      <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 gap-2 sm:gap-4 flex-shrink-0">
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            await dispatch(
                              updateQtyThunk({
                                productId: product._id,
                                change: -1,
                              }),
                            );
                          }}
                          className="p-1 hover:text-[#77cd3af2] transition-colors"
                        >
                          <Minus size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                        <span className="text-xs sm:text-sm font-medium dark:text-white min-w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            await dispatch(
                              updateQtyThunk({
                                productId: product._id,
                                change: 1,
                              }),
                            );
                          }}
                          disabled={item.quantity >= product.stock}
                          className={`p-1 hover:text-[#77cd3af2] transition-colors ${item.quantity >= product.stock ? "opacity-20 cursor-not-allowed" : ""}`}
                        >
                          <Plus size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>

                      {/* Item Total Price: Đảm bảo không bị vỡ bố cục khi số tiền lớn */}
                      <div className="flex items-baseline gap-1.5 flex-shrink-0 min-w-0">
                        {isComboItem ? (
                          <>
                            <span className="text-[10px] sm:text-[11px] line-through text-gray-400/40 truncate">
                              $
                              {(product.price * item.quantity).toLocaleString()}
                            </span>
                            <span className="font-bold text-sm sm:text-base text-[#77cd3af2] truncate">
                              ${(displayPrice * item.quantity).toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-sm sm:text-base dark:text-white truncate">
                            ${(product.price * item.quantity).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove Button: Trên mobile nút hiển thị mặc định (opacity-100) để dễ chạm, trên Desktop ẩn đi và hover mới hiện */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      dispatch(removeFromCartThunk({ productId: product._id }));
                    }}
                    className="absolute right-0 top-0 md:opacity-0 md:group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all cursor-pointer p-1"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-dashed border-gray-200 dark:border-white/10">
                <ShoppingBag
                  size={26}
                  className="sm:w-[30px] sm:h-[30px]"
                  opacity={0.3}
                />
              </div>
              <p className="italic font-serif text-sm sm:text-base text-center px-4">
                Your cart is feeling a bit empty...
              </p>
            </div>
          )}
        </div>

        {/* FOOTER: Tổng tiền & Nút checkout diện tích lớn chuẩn Mobile */}
        <div className="p-5 sm:p-6 md:p-8 pt-4 md:pt-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="flex justify-between items-end mb-5 md:mb-8">
            <div className="space-y-0.5 md:space-y-1">
              <p className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold">
                Subtotal
              </p>
              {originalTotal > actualTotal && (
                <p className="text-[10px] md:text-[11px] font-medium text-red-500">
                  Saved: -${(originalTotal - actualTotal).toLocaleString()}
                </p>
              )}
            </div>

            <div className="text-right">
              {originalTotal > actualTotal && (
                <p className="text-[10px] md:text-xs line-through text-gray-400/40 mb-0.5">
                  ${originalTotal.toLocaleString()}
                </p>
              )}
              <p className="text-2xl md:text-3xl font-light dark:text-white tracking-tight">
                ${actualTotal.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Checkout Button: Bo góc mượt hơn (rounded-xl), chiều cao py-4 vừa vặn cho ngón tay bấm trên Mobile */}
          <button
            onClick={() => {
              handleClose();
              navigate("/checkout", { state: { subtotal: actualTotal } });
            }}
            className="relative w-full group overflow-hidden rounded-xl md:rounded-2xl bg-black dark:bg-[#77cd3af2] py-4 md:py-5 transition-all hover:scale-[1.01] md:hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <div className="relative z-10 flex items-center justify-center gap-3 text-white dark:text-black font-bold tracking-widest text-[10px] md:text-xs uppercase">
              <span>Continue to checkout</span>
            </div>
            <div className="absolute inset-0 bg-white/10 dark:bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default CartSidebar;
