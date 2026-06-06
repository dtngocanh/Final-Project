import { useDispatch, useSelector } from "react-redux";
import { updateCart } from "../store/slices/cartSlice";
import { toast } from "react-toastify";
import { trackClickThunk } from "../store/slices/interactionSlice";

export const useCartActions = () => {
  const dispatch = useDispatch();

  const { cart } = useSelector((state) => state.cart);

  const handleCartAction = async (
    product,
    type,
    change = 1,
    silent = false,
  ) => {
    let newCart = JSON.parse(JSON.stringify(cart));
    const stockAvailable = product ? Number(product.stock) : 0;

    if (type === "CLEAR_CART") {
      newCart = [];
      if (!silent) toast.success("Cleared your bag");
      return await dispatch(updateCart(newCart));
    }

    if (!product) return;

    if (type === "ADD") {
      // console.log("ADD CALLED:", product._id);
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
        if (!silent) toast.error("Out of stock");
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
          toast.error(`${targetItem.name} is insuficient`);
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

  return { handleCartAction };
};
