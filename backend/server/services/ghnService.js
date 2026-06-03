import axios from "axios";
import ErrorHandler from "../utils/errorHandler.js";
import { convertVNDToUSD } from "./currencyService.js";

const ghnReq = axios.create({
  baseURL: process.env.GHN_BASE_URL,
  headers: {
    Token: process.env.GHN_TOKEN,
    ShopId: Number(process.env.GHN_SHOP_ID),
  },
});

const getWeight = (item) => {
  if (item.weight) return item.weight;

  switch (item.categoryName) {
    case "Vegetables":
      return 500;

    case "Meats and Seafood":
      return 1000;

    case "Fruits":
      return 1000;

    case "Packages":
      return 750;

    default:
      return 500;
  }
};

// const getWeight = (item) => {
//   if (item.weight) return item.weight;

//   const categoryIdStr = item.categoryId?.toString(); 

//   switch (categoryIdStr) {
//     case "69dda0160eec98d26c650d36":  // Packages
//       return 500;

//     case "6a1921ff9388a017488ab5fa": // Herbs & Seasonings
//       return 200;

//     default:
//       return 1000;
//   }
// };

export const calculateShippingFee = async ({
  cartItems,
  to_district_id,
  to_ward_code,
}) => {
  try {
    if (!cartItems || cartItems.length === 0) {
      throw new ErrorHandler("Cart items are required", 400);
    }

    if (!to_district_id || !to_ward_code) {
      throw new ErrorHandler("Shipping address is required", 400);
    }

    const DISTRICT_ID = Number(process.env.GHN_FROM_DISTRICT);

    // Available services
    const serviceRes = await ghnReq.post(
      "/v2/shipping-order/available-services",
      {
        shop_id: Number(process.env.GHN_SHOP_ID),

        from_district: DISTRICT_ID,

        to_district: Number(to_district_id),
      },
    );

    const services = serviceRes.data?.data;

    if (!services || services.length === 0) {
      throw new ErrorHandler(
        "Shipping not available for this location.",
        400,
      );
    }

    const active_service_id = services[0].service_id;

    // Total weight
    const totalWeight = cartItems.reduce((sum, item) => {
      return sum + item.quantity * getWeight(item);
    }, 0);

    // Calculate fee
    const feeRes = await ghnReq.post("/v2/shipping-order/fee", {
      service_id: Number(active_service_id),

      from_district_id: DISTRICT_ID,

      to_district_id: Number(to_district_id),

      to_ward_code: String(to_ward_code),

      weight: totalWeight || 1000,

      insurance_value: 0,
    });

    const feeVND = feeRes.data?.data?.total || 0;

    const feeUSD = await convertVNDToUSD(feeVND);

    return {
      feeVND,
      feeUSD,
      service_name: services[0].short_name,
      totalWeight,
    };
  } catch (error) {
    console.error(
      "GHN SHIPPING ERROR:",
      error.response?.data || error.message,
    );

    throw error;
  }
};