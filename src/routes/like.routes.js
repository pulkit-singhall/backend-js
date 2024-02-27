import express from "express";
import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
} from "../controllers/like.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const likeRouter = express.Router();

likeRouter
    .route("/toggle-video-like/:videoId")
    .post(verifyUser, toggleVideoLike);
likeRouter
    .route("/toggle-comment-like/:commentId")
    .post(verifyUser, toggleCommentLike);
likeRouter
    .route("/toggle-tweet-like/:tweetId")
    .post(verifyUser, toggleTweetLike);
likeRouter.route("/liked-videos").get(verifyUser, getLikedVideos);

export { likeRouter };
