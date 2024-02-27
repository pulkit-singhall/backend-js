import express from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    updateUserAvatar,
    updateUserCoverImage,
    changeCurrentPassword,
    getCurrentUser,
    refreshAccessToken,
    getUserById,
} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const userRoute = express.Router();

userRoute.route("/register").post(
    // middleware injection 
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);
userRoute.route("/login").post(loginUser);
userRoute.route("/token-refresh").post(refreshAccessToken);

// secured routes 
userRoute.route("/logout").post(verifyUser, logoutUser);
userRoute.route("/change-password").patch(verifyUser, changeCurrentPassword);
userRoute.route("/update-avatar").patch(verifyUser,
    upload.fields([{ name: "newAvatar", maxCount: 1 }]),
    updateUserAvatar);
userRoute.route("/update-coverImage").patch(verifyUser,
    upload.fields([{ name: "newCoverImage", maxCount: 1 }]),
    updateUserCoverImage);
userRoute.route("/current-user").get(verifyUser, getCurrentUser);
userRoute.route("/get-user/:userId").get(getUserById);

// another way
// userRoute.get('/login', loginUser);

export { userRoute };
