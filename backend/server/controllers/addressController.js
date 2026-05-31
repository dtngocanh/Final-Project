import { Province } from "../models/Address.js";
import axios from "axios";
import ErrorHandler from "../utils/errorHandler.js";


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

