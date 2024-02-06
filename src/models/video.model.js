import mongoose from "mongoose";


const videoSchema = new mongoose.Schema({
    videoFile: {
        type: String,
        required: [true, "Videofile is required"],
    },
    thumbnail: {
        type: String,
        required: [true, "Thumbnail is required"],
    },
    title: {
        type: String,
        required: [true, "Title is required"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
    },
    views: {
        type: Number,
        default: 0,
    },
    duration: {
        type: Number,
        required: [true, "Duration is required"],
    },
    isPublished: {
        type: Boolean,
        default:true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });


export const Video = mongoose.model("Video", videoSchema);