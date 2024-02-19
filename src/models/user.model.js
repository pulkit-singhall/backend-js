/*
    access token -> authenticate user based on email and password.

    refresh token -> authorise user based on a token string. 
    This token string is stored both on the client side and in the 
    database also to match it.
    No need to give password again and again.
*/

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
    username : {
        type: String,
        required: [true, "Username is required"],
        unique: [true, "Username should be unique"],
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email already exists"],
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: [true, "Full name is required"],
        index: true,
        trim: true,
    },
    avatar: { // form of files
        type: String,
        required: true, 
    },
    coverImage: { // form of files
        type: String,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        }
    ],
    refreshToken : {
        type: String,
    }
}, { timestamps: true });

// for hashing of password
userSchema.pre("save", async function (next) {  // for this keyword
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 5);   
    }
    next();
});

// to check if the password matches with the encrypted password
userSchema.methods.checkPassword = async function (userPassword) {
    const result = await bcrypt.compare(userPassword, this.password);
    return result; 
}

// for jwt token to authorise user
userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        // payload
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
}

userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        // payload
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
}

export const User = mongoose.model("User", userSchema); 