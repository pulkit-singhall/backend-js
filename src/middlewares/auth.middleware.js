// middleware for authenticate and authorise user

import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import dotenv from "dotenv";
import { User } from "../models/user.model.js"

dotenv.config();

const verifyUser = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", ""); // for mobile apps
        
        if (!token) {
            throw new ApiError(404, "Access Token Required");
        }
    
        // returns payload
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        if (!decodedToken) {
            throw new ApiError(405, "Invalid Token");
        }
    
        const user = await User.findById(decodedToken._id).select(
            "-password -refreshToken"
        );
    
        if (!user) {
            throw new ApiError(405, "Invalid Token for User");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(400, `Error : ${error}`);
    }
});

export {
    verifyUser
}