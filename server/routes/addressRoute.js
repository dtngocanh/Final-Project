import express from "express";
import {
    addAddress,
    getUserAddress
} from "../controllers/addressController.js";

import authUser from "../middlewares/authUser.js";

const addressRouter = express.Router();

addressRouter.post("/add", authUser, addAddress);

addressRouter.get("/get", authUser, getUserAddress);

export default addressRouter;