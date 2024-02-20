import express from "express";
import {
    getTweets,
    deleteTweet,
    updateTweet,
    createTweet,
} from "../controllers/tweet.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js"

const tweetRoute = express.Router();

tweetRoute.route("/create-tweet").post(verifyUser, createTweet);
tweetRoute.route("/get-tweets/:username").get(getTweets);
tweetRoute.route("/update-tweet/:tweetId").patch(verifyUser, updateTweet);
tweetRoute.route("/delete-tweet/:tweetId").delete(verifyUser, deleteTweet);

export { tweetRoute };