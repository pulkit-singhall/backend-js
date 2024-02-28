import express from "express";
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controller.js";

const dashboardRoute = express.Router();

dashboardRoute.route("/get-channel-videos/:channelId").get(getChannelVideos);
dashboardRoute.route("/get-channel-stats/:channelId").get(getChannelStats);

export {
    dashboardRoute,
}