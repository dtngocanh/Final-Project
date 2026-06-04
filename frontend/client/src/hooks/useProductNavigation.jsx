import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { trackClickThunk } from "../store/slices/interactionSlice";

export const useProductNavigation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleProductClick = (productId) => {
    if (!productId) return;

    dispatch(
      trackClickThunk({
        productId: productId,
        action: "view",
      })
    );

    navigate(`/product/${productId}`);
  };

  return { handleProductClick };
};