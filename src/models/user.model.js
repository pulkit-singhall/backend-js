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
    },
    avatar: {
        type: String,
    },
    coverImage: {
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
}, { timestamps: true });

// for hashing of password
userSchema.pre("save", async function (err, req, res, next) {  // for this keyword
    if (this.isModified("password")) {
        this.password = bcrypt.hash(this.password, 5);   
    }
    next();
});

// to check if the password matches with the encrypted password
userSchema.methods.checkPassword = async function (userPassword) {
    const result = await bcrypt.compare(userPassword, this.password);
    return result; 
}

// for jwt token to authorise user
userSchema.methods.accessToken = async function () {
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

userSchema.methods.refreshToken = async function () {
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