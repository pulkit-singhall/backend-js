import express from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import {
    getVideoById,
    deleteVideo,
    togglePublishStatus,
    createVideo,
} from "../controllers/video.controller.js";
import upload from "../middlewares/multer.middleware.js";

const videoRoute = express.Router();

videoRoute.route("/get-video/:videoId").get(getVideoById);
videoRoute.route("/delete-video/:videoId").delete(verifyUser, deleteVideo);
videoRoute
    .route("/toggle-publish/:videoId")
    .patch(verifyUser, togglePublishStatus);
videoRoute.route("/create-video").post(
    verifyUser,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    createVideo
);

export { videoRoute };
