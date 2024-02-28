import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId || channelId.trim() === "") {
        throw new ApiError(400, "Channel ID is required");
    }

    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(402, "Wrong Channel ID");
    }

    /*
        total video likes
        total videos
        total video views
    */

    // total videos and video views
    const videoDetails = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videosList",
// videosList array has been added to the user document
                pipeline: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "likedVideoList",
// likedVideoList array has been added to the videosList document at current video index
                        },
                    },
                    {
                        $addFields: {
                            likes: {
                                $size: "$likedVideoList",
                            },
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$videosList",
                },
                totalVideoViews: {
                    $sum: "$videosList.views",
                },
                totalVideoLikes: {
                    $sum: "$videosList.likes",
                },
            },
        },
        {
            $project: {
                totalVideos: 1,
                totalVideoViews: 1,
                totalVideoLikes: 1,
            },
        },
    ]);

    if (!videoDetails || videoDetails.length === 0) {
        throw new ApiError(500, "Internal error in fetching channel stats");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos: videoDetails[0].totalVideos,
                totalVideoViews: videoDetails[0].totalVideoViews,
                totalVideoLikes: videoDetails[0].totalVideoLikes,
            },
            "Channel Stats Fetched!"
        )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId || channelId.trim() === "") {
        throw new ApiError(400, "Channel ID is required");
    }

    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(402, "Wrong Channel ID");
    }

    const videoList = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videoList",
            },
        },
        {
            $addFields: {
                channelVideos: "$videoList._id",
            },
        },
        {
            $project: {
                channelVideos: 1,
            },
        },
    ]);

    if (!videoList || videoList.length === "") {
        throw new ApiError(500, "Internal error in fetching channel videos");
    }

    const channelVideos = videoList[0].channelVideos;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                channelVideos: channelVideos,
            },
            "Channel videos fetched!"
        )
    );
});

export { getChannelStats, getChannelVideos };
