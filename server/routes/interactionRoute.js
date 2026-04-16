import express from "express";
import authUser from "../middlewares/authUser.js";
import {
  getInteractions,
  trackClick,
} from "../controllers/interactionController.js";

const interactionRouter = express.Router();

// Endpoint: POST /api/interactions/track
interactionRouter.post("/track", authUser, trackClick);

// Endpoint: GET /api/interactions
interactionRouter.get("/", getInteractions);

export default interactionRouter;
