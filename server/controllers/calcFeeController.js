import { calculateShippingFee } from "../services/ghnService.js";

export const calcFee = async (req, res, next) => {
  try {
    const { cartItems, to_district_id, to_ward_code } = req.body;

    const result = await calculateShippingFee({
      cartItems,
      to_district_id,
      to_ward_code,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};