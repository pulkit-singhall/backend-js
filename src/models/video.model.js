import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
    videoFile: { // video
        type: String,
        required: [true, "Videofile is required"],
    },
    videoFilePublicId: {
        type: String,
    },
    thumbnail: { // image
        type: String,
        required: [true, "Thumbnail is required"],
    },
    thumbnailPublicId: {
        type: String,
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
        type: Number,
        default: 1, // 1 for true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });


videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);