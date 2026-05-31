import express from "express";
import authUser from "../middlewares/authUser.js";
import {
  getHomeRecommendations,
  getInteractions,
  trackInteraction,
} from "../controllers/interactionController.js";

const interactionRouter = express.Router();

// Endpoint: POST /api/interactions/track
interactionRouter.post("/track", authUser, trackInteraction);

// Endpoint: GET /api/interactions
interactionRouter.get("/", getInteractions);

interactionRouter.get("/recommendations", authUser, getHomeRecommendations);




export default interactionRouter;
