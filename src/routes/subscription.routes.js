import express from "express";
import {
    toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers,
} from "../controllers/subscription.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const subscriptionRoute = express.Router();

subscriptionRoute
    .route("/toggle-sub/:channelId")
    .post(verifyUser, toggleSubscription);
subscriptionRoute
    .route("/subscribers/:channelId")
    .get(getUserChannelSubscribers);
subscriptionRoute
    .route("/subscribedTo/:subscriberId")
    .get(getSubscribedChannels);

export { subscriptionRoute };
