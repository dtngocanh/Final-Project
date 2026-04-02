import { useDispatch, useSelector } from "react-redux";
import { updateCart } from "../store/slices/cartSlice";
export const useCartActions = () => {
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);

  const handleCartAction = (product, type, change = 1) => {
    let newCart = [...cart];

    if (type === 'ADD') {
      const existingItem = newCart.find(item => item.product._id === product._id);
      if (existingItem) {
        newCart = newCart.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + change }
            : item
        );
      } else {
        newCart.push({ product, quantity: change });
      }
    }

    if (type === 'REMOVE') {
      newCart = newCart.filter(item => item.product._id !== product._id);
    }

    if (type === 'UPDATE_QTY') {
      newCart = newCart.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + change }
          : item
      ).filter(item => item.quantity > 0);
    }

    dispatch(updateCart(newCart));
  };

  return { handleCartAction }; // Trả về hàm để các component khác sử dụng
};