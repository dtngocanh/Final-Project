import { useDispatch, useSelector } from "react-redux";
import { updateCart } from "../store/slices/cartSlice";
import { toast } from "react-toastify";
import { trackClickThunk } from "../store/slices/interactionSlice";

export const useCartActions = () => {
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);

  const handleCartAction = (product, type, change = 1) => {
    let newCart = [...cart];

    const stockAvailable = Number(product.stock) || 0;

    if (type === "ADD") {
      dispatch(
        trackClickThunk({
          productId: product._id,
          action: "add_to_cart",
        }),
      );
      const existingItem = newCart.find(
        (item) => item.product._id === product._id,
      );
      const currentQty = existingItem ? existingItem.quantity : 0;
      const nextQty = currentQty + change;

      if (nextQty > stockAvailable) {
        toast.error(`Sorry, we only have ${stockAvailable} items in stock.`);
        return;
      }

      if (existingItem) {
        newCart = newCart.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: nextQty }
            : item,
        );
      } else {
        newCart.push({ product, quantity: change });
      }

      toast.success(
        <div className="flex items-center gap-3">
          <img src="/logohaha.png" alt="" className="w-8 h-8 object-contain" />
          <div>
            <p className="text-sm font-bold">Yum! Added!</p>
            <p className="text-xs font-serif italic text-gray-500 dark:text-gray-400">
              {product.name} is in your cart
            </p>
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 2000,
          icon: false,
          className:
            "border-l-4 border-[#77cd3a] rounded-xl shadow-2xl dark:bg-[#1a1a1a] dark:text-white bg-white text-gray-800",
          progressClassName: "bg-[#77cd3a]",
        },
      );
    }

    if (type === "REMOVE") {
      newCart = newCart.filter((item) => item.product._id !== product._id);
    }

    if (type === "UPDATE_QTY") {
      const targetItem = newCart.find(
        (item) => item.product._id === product._id,
      );

      if (targetItem) {
        const nextQty = targetItem.quantity + change;

        if (change > 0 && nextQty > stockAvailable) {
          toast.error(`Sorry, we only have ${stockAvailable} items in stock.`);
          return;
        }

        newCart = newCart
          .map((item) =>
            item.product._id === product._id
              ? { ...item, quantity: nextQty }
              : item,
          )
          .filter((item) => item.quantity > 0);
      }
    }

    dispatch(updateCart(newCart));
  };

  return { handleCartAction }; // Trả về hàm để các component khác sử dụng
};
