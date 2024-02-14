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
} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";

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
userRoute.route("/login").get(loginUser);
userRoute.route("/logout").get(logoutUser);

// another way
// userRoute.get('/login', loginUser);

export { userRoute };
