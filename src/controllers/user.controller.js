import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler((req, res) => {
    res.json({
        "message": "register",
    });
});

const loginUser = asyncHandler((req, res) => {
    res.json({
        "message": "login",
    });
});

export {
    registerUser,
    loginUser,
}