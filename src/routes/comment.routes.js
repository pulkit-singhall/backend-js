import express from "express";
import { verifyUser } from "../middlewares/auth.middleware.js"
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
} from "../controllers/comment.controller.js";

const commentRoute = express.Router();

commentRoute.route("/update-comment/:commentId").patch(verifyUser, updateComment);
commentRoute.route("/delete-comment/:commentId").delete(verifyUser, deleteComment);
commentRoute.route("/add-comment/:videoId").post(verifyUser, addComment);
commentRoute.route("/get-video-comments/:videoId").get(getVideoComments);

export {
    commentRoute,
}