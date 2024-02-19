import express from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    changeCurrentPassword,
    getCurrentUser,
    refreshAccessToken
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
userRoute.route("/change-password").post(verifyUser, changeCurrentPassword);
userRoute.route("/update-avatar").post(verifyUser, updateUserAvatar);
userRoute.route("/update-coverImage").post(verifyUser, updateUserCoverImage);
userRoute.route("/update-account").post(verifyUser, updateAccountDetails);

// another way
// userRoute.get('/login', loginUser);

export { userRoute };
