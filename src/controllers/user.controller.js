import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
    uploadFilesToCloud,
    deleteImageFileFromCloud,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { cookieOptions } from "../constants.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

// access and refresh tokens
async function generateTokens(user) {
    try {
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return {
            accessToken,
            refreshToken,
        };
    } catch (error) {
        throw new ApiError(500, "Error in token generation!");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    /*
        get user details from frontend
        validation - not empty
        check if user already exists: username, email
        check for images, check for avatar
        upload them to cloudinary, avatar
        create user object - create entry in db
        remove password and refresh token field from response
        check for user creation
        return res
    */

    const { username, email, fullname, password } = await req.body;

    if (
        [username, email, fullname, password].some((field) => {
            // to prevent undefined
            if (!field) {
                return true;
            }
            if (field.trim() === "") {
                return true;
            }
        })
    ) {
        throw new ApiError(405, "All fields are required!");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(410, "User Already Exists!");
    }

    const files = await req.files; // file is already with multer

    let cloudUrlAvatar = "";
    let cloudUrlCoverImage = "";
    let cloudPublicIdAvatar = "";
    let cloudPublicIdCoverImage = "";
    if (files && Array.isArray(files.avatar) && files.avatar.length > 0) {
        const cloudResponseAvatar = await uploadFilesToCloud(
            files.avatar[0].path
        );
        cloudUrlAvatar = cloudResponseAvatar.url;
        cloudPublicIdAvatar = cloudResponseAvatar.public_id;
    } else {
        throw new ApiError(412, "Avatar is required!");
    }

    if (
        files &&
        Array.isArray(files.coverImage) &&
        files.coverImage.length > 0
    ) {
        const cloudResponseCoverImage = await uploadFilesToCloud(
            files.coverImage[0].path
        );
        cloudUrlCoverImage = cloudResponseCoverImage.url;
        cloudPublicIdCoverImage = cloudResponseCoverImage.public_id;
    }

    const user = await User.create({
        username: username.toLowerCase(),
        avatar: cloudUrlAvatar,
        fullname: fullname,
        email: email,
        password: password,
        coverImage: cloudUrlCoverImage,
        avatarPublicId: cloudPublicIdAvatar,
        coverImagePublicId: cloudPublicIdCoverImage,
    });

    const newUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!newUser) {
        throw new ApiError(500, "User not registered!");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, newUser, "Registeration Success"));
});

const loginUser = asyncHandler(async (req, res) => {
    /*
        req body -> data
        username or email
        find the user
        password check
        access and referesh token
        send cookie
    */

    const { email, password, username } = await req.body;

    if (
        [email, password, username].some((field) => {
            if (!field) {
                return true;
            }
            if (field.trim() === "") {
                return true;
            }
        })
    ) {
        throw new ApiError(405, "All fields are required!");
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (!existedUser) {
        throw new ApiError(403, "Invalid User");
    }

    const passwordCheck = await existedUser.checkPassword(password);

    if (!passwordCheck) {
        throw new ApiError(412, "Wrong Password!");
    }

    const { accessToken, refreshToken } = await generateTokens(existedUser);

    const loggedInUser = await User.findById(existedUser._id).select(
        "-password -refreshToken"
    );

    return res
        .status(202)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                202,
                {
                    user: loggedInUser,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                },
                "Login Success!"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    // clear all req cookies
    // delete refresh token from database

    const user = await req.user;

    if (!user) {
        throw new ApiError(405, "User not authorize to logout");
    }

    await User.findByIdAndUpdate(
        user._id,
        {
            $set: {
                refreshToken: "",
            },
        },
        {
            new: true,
        }
    );

    return res
        .status(201)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(201, {}, "Logged Out Success!"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken =
            req.cookies?.refreshToken || req.body?.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(404, "Refresh Token Required");
        }

        // returns payload
        const decodedIncomingRefreshToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        if (!decodedIncomingRefreshToken) {
            throw new ApiError(405, "Invalid Token");
        }

        const user = await User.findById(
            decodedIncomingRefreshToken._id
        ).select("-password");

        if (!user) {
            throw new ApiError(405, "Invalid Token for User");
        }

        if (user.refreshToken != incomingRefreshToken) {
            throw new ApiError(407, "Refresh token doesnt match");
        }

        const { accessToken, refreshToken } = await generateTokens(user);

        return res
            .status(201)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    201,
                    {
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                    },
                    "Access Token Refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(400, `Error : ${error}`);
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("-refreshToken");

    if (!user) {
        throw new ApiError(405, "User not authorize to change Password");
    }

    const passwordCheck = await user.checkPassword(oldPassword);

    if (!passwordCheck) {
        throw new ApiError(408, "Old Password is not correct");
    }

    // for bycrypting password
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(201).json(new ApiResponse(201, {}, "Password Changed"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user;
    const currentUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: currentUser,
            },
            "Current User Fetched!"
        )
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    /*
        get new avatar from req through multer
        upload new avatar on cloudinary
        update user in database
        delete previous avatar from cloudinary
    */

    const files = req.files;

    let newAvatarResponseUrl = "";
    let newAvatarResponsePublicId = "";
    if (files && Array.isArray(files.newAvatar) && files.newAvatar.length > 0) {
        const newAvatarLocalPath = files.newAvatar[0].path;
        const newAvatarResponse = await uploadFilesToCloud(newAvatarLocalPath);
        newAvatarResponseUrl = newAvatarResponse.url;
        newAvatarResponsePublicId = newAvatarResponse.public_id;
    } else {
        throw new ApiError(405, "New Avatar is Required");
    }

    const user = await User.findById(req.user._id);
    const oldAvatarPublicId = user.avatarPublicId;

    user.avatar = newAvatarResponseUrl;
    user.avatarPublicId = newAvatarResponsePublicId;
    await user.save({ validateBeforeSave: false });

    await deleteImageFileFromCloud(oldAvatarPublicId);

    return res.status(201).json(new ApiResponse(201, {}, "Avatar is Changed"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const files = req.files;

    let newCoverImageResponseUrl = "";
    let newCoverImageResponsePublicId = "";
    if (
        files &&
        Array.isArray(files.newCoverImage) &&
        files.newCoverImage.length > 0
    ) {
        const newCoverImageLocalPath = files.newCoverImage[0].path;
        const newCoverImageResponse = await uploadFilesToCloud(
            newCoverImageLocalPath
        );
        newCoverImageResponseUrl = newCoverImageResponse.url;
        newCoverImageResponsePublicId = newCoverImageResponse.public_id;
    } else {
        throw new ApiError(405, "New CoverImage is Required");
    }

    const user = await User.findById(req.user._id);
    const oldCoverImagePublicId = user.CoverImagePublicId;

    user.CoverImage = newCoverImageResponseUrl;
    user.CoverImagePublicId = newCoverImageResponsePublicId;
    await user.save({ validateBeforeSave: false });

    await deleteImageFileFromCloud(oldCoverImagePublicId);

    return res
        .status(201)
        .json(new ApiResponse(201, {}, "CoverImage is Changed"));
});

const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId || userId.trim() === "") {
        throw new ApiError(400, "User Id is required");
    }

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(400, "Wrong User Id");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: user,
            },
            "User Fetched Successfully"
        )
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    updateUserAvatar,
    updateUserCoverImage,
    changeCurrentPassword,
    getCurrentUser,
    refreshAccessToken,
    getUserById,
};
