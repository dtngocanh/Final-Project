import { useDispatch, useSelector } from "react-redux";
import { updateCart } from "../store/slices/cartSlice";
import { toast } from "react-toastify";
import { trackClickThunk } from "../store/slices/interactionSlice";

export const useCartActions = () => {
  const dispatch = useDispatch();

  const handleCartAction = async (
    product,
    type,
    change = 1,
    silent = false,
  ) => {
    const currentStore = await dispatch((_, getState) => getState());
    const latestCart = JSON.parse(JSON.stringify(currentStore.cart.cart));

    let newCart = latestCart;
    const stockAvailable = Number(product.stock);

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
      const nextQty = (existingItem ? existingItem.quantity : 0) + change;

      if (nextQty > stockAvailable) {
        if (!silent) toast.error("Out of stock!");
        return;
      }

      if (existingItem) {
        existingItem.quantity = nextQty;
      } else {
        newCart.push({ product, quantity: change });
      }

      if (!silent) toast.success(`Added ${product.name}`);
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

    return await dispatch(updateCart(newCart));
  };

  return { handleCartAction }; // Trả về hàm để các component khác sử dụng
};
