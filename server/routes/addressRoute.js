import express from "express";
import authUser from "../middlewares/authUser.js";
import axios from "axios";
import { calcFee, getProvinces } from "../controllers/addressController.js";

const addressRouter = express.Router();

addressRouter.get("/provinces", getProvinces);

addressRouter.get("/districts/:provinceId", async (req, res, next) => {
  try {
    const { provinceId } = req.params;
    const response = await axios.get(
      `${process.env.GHN_BASE_URL}/master-data/district?province_id=${provinceId}`,
      {
        headers: { Token: process.env.GHN_TOKEN },
      },
    );
    res.status(200).json(response.data);
  } catch (error) {
    next(error);
  }
});

addressRouter.get("/wards/:districtId", async (req, res, next) => {
  try {
    const { districtId } = req.params;

    const response = await axios.get(
      `${process.env.GHN_BASE_URL}/master-data/ward?district_id=${districtId}`,
      {
        headers: {
          Token: process.env.GHN_TOKEN,
          "Content-Type": "application/json",
        },
      },
    );

    res.status(200).json(response.data);
  } catch (error) {
    next(error);
  }
});

addressRouter.post("/calc-fee", calcFee);

export default addressRouter;
