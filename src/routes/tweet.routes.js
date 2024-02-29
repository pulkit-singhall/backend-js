import express from "express";
import {
    getUserTweets,
    deleteTweet,
    updateTweet,
    createTweet,
    getTweetById,
} from "../controllers/tweet.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js"

const tweetRoute = express.Router();

tweetRoute.route("/create-tweet").post(verifyUser, createTweet);
tweetRoute.route("/get-tweets/:username").get(getUserTweets);
tweetRoute.route("/update-tweet/:tweetId").patch(verifyUser, updateTweet);
tweetRoute.route("/delete-tweet/:tweetId").delete(verifyUser, deleteTweet);
tweetRoute.route("/get-tweet/:tweetId").get(getTweetById);

export { tweetRoute };