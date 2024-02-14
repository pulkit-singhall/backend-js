import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadFilesToCloud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    if (files && Array.isArray(files.avatar) && files.avatar.length > 0) {
        const cloudResponseAvatar = await uploadFilesToCloud(files.avatar[0].path);
        cloudUrlAvatar = cloudResponseAvatar.url;
    }
    else {
        throw new ApiError(412, "Avatar is required!");
    }

    if (files && Array.isArray(files.coverImage) && files.coverImage.length > 0) {
        const cloudResponseCoverImage = await uploadFilesToCloud(files.coverImage[0].path);
        cloudUrlCoverImage = cloudResponseCoverImage.url;
    }

    const user = await User.create({
        username: username.toLowerCase(),
        avatar: cloudUrlAvatar,
        fullname: fullname,
        email: email,
        password: password,
        coverImage: cloudUrlCoverImage,
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
            if (field?.trim() === "") {
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
});

const logoutUser = asyncHandler(async (req, res) => {});

const changeCurrentPassword = asyncHandler(async (req, res) => {});

const getCurrentUser = asyncHandler(async (req, res) => {});

const updateAccountDetails = asyncHandler(async (req, res) => {});

const updateUserAvatar = asyncHandler(async (req, res) => {});

const updateUserCoverImage = asyncHandler(async (req, res) => {});

export {
    registerUser,
    loginUser,
    logoutUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    changeCurrentPassword,
    getCurrentUser,
};