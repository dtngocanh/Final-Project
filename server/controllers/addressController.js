import { Province } from "../models/Address.js";
import axios from "axios";

export const addAddress = async (req, res) => {
  try {
    const {
      userId,
      firstName,
      lastName,
      email,
      street,
      city,
      zipcode,
      country,
      phone,
    } = req.body;

    if (
      !userId ||
      !firstName ||
      !lastName ||
      !email ||
      !street ||
      !city ||
      !zipcode ||
      !country ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const newAddress = new Address({
      userId,
      firstName,
      lastName,
      email,
      street,
      city,
      zipcode,
      country,
      phone,
    });

    await newAddress.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserAddress = async (req, res) => {
  try {
    const userId = req.body;

    const addresses = await Address.find({ userId });

    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProvinces = async (req, res, next) => {
  try {
    const provinces = await Province.find();

    res.status(200).json({
      success: true,
      data: provinces,
    });
  } catch (error) {
    next(error);
  }
};

// Create instance GHN
const ghnReq = axios.create({
  baseURL: process.env.GHN_BASE_URL,
  headers: {
    Token: process.env.GHN_TOKEN,
    ShopId: process.env.GHN_SHOP_ID,
  },
});

// Convert VND → USD
const convertToUSD = async (vnd) => {
  try {
    const res = await axios.get(
      "https://api.exchangerate-api.com/v4/latest/VND",
    );
    const rate = res.data.rates.USD;
    return Number((vnd * rate).toFixed(2));
  } catch (error) {
    console.error("Convert USD error:", error.message);
    return 0;
  }
};

export const calcFee = async (req, res, next) => {
  try {
    const { cartItems, to_district_id, to_ward_code } = req.body;

    if (!cartItems || !to_district_id || !to_ward_code) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const totalWeight = cartItems.reduce((sum, item) => {
      return sum + item.quantity * 1000; // mỗi item = 1kg
    }, 0);

    const serviceRes = await ghnReq.post(
      "/v2/shipping-order/available-services",
      {
        shop_id: Number(process.env.GHN_SHOP_ID),
        from_district: 1454,
        to_district: Number(to_district_id),
      },
    );

    const services = serviceRes.data?.data;

    if (!services || services.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No shipping service available",
      });
    }

    const service_id = services[0].service_id;

    const feeRes = await ghnReq.post("/v2/shipping-order/fee", {
      service_id,
      from_district_id: 1454,
      to_district_id: Number(to_district_id),
      to_ward_code: String(to_ward_code),
      weight: totalWeight || 1000,
      insurance_value: 500000,
    });

    const feeVND = feeRes.data?.data?.total || 0;

    // Convert USD
    const feeUSD = await convertToUSD(feeVND);

    return res.status(200).json({
      success: true,
      feeVND,
      feeUSD,
      weight: totalWeight,
    });
  } catch (error) {
    console.error("GHN ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || "Internal Server Error",
    });
  }
};
