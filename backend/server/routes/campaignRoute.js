import express from "express";
import {
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  manualTriggerDiscount, //  Import thêm hàm này vào
} from "../controllers/campaignController.js";

const campaignRouter = express.Router();

campaignRouter.route("/").get(getCampaigns).post(createCampaign);
campaignRouter.route("/:id").put(updateCampaign).delete(deleteCampaign);

//  THÊM DÒNG NÀY ĐỂ TẠO ĐƯỜNG DẪN BẤM TEST BẰNG TAY
campaignRouter.post("/test-trigger/:id", manualTriggerDiscount);

export default campaignRouter;