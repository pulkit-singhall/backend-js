import mongoose from "mongoose";


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


export const User = mongoose.model("User", userSchema); 