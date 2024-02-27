import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import mongoose from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const user = req.user;

    if (!videoId || videoId.trim() === "") {
        throw new ApiError(400, "Video ID is required");
    }

    const alreadyLiked = await Like.findOne({
        $and: [{ likedBy: user._id }, { video: videoId }],
    });

    if (alreadyLiked) {
        const likeId = alreadyLiked._id;
        const toggledVideoLike = await Like.findByIdAndDelete(likeId);
        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    { toggledVideoLike: toggledVideoLike },
                    "Video Like Toggled"
                )
            );
    }

    const createdVideoLike = await Like.create({
        likedBy: user._id,
        video: videoId,
        comment: undefined,
        tweet: undefined,
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { toggledVideoLike: createdVideoLike },
                "Video Like Toggled"
            )
        );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const user = req.user;

    if (!commentId || commentId.trim() === "") {
        throw new ApiError(400, "Comment ID is required");
    }

    const alreadyLiked = await Like.findOne({
        $and: [{ likedBy: user._id }, { comment: commentId }],
    });

    if (alreadyLiked) {
        const likeId = alreadyLiked._id;
        const toggledCommentLike = await Like.findByIdAndDelete(likeId);
        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    { toggledCommentLike: toggledCommentLike },
                    "Comment Like Toggled"
                )
            );
    }

    const createdCommentLike = await Like.create({
        likedBy: user._id,
        comment: commentId,
        video: undefined,
        tweet: undefined,
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { createdCommentLike: createdCommentLike },
                "Comment Like Toggled"
            )
        );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const user = req.user;

    if (!tweetId || tweetId.trim() === "") {
        throw new ApiError(400, "Tweet ID is required");
    }

    const alreadyLiked = await Like.findOne({
        $and: [{ likedBy: user._id }, { tweet: tweetId }],
    });

    if (alreadyLiked) {
        const likeId = alreadyLiked._id;
        const toggledTweetLike = await Like.findByIdAndDelete(likeId);
        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    { toggledTweetLike: toggledTweetLike },
                    "Tweet Like Toggled"
                )
            );
    }

    const createdTweetLike = await Like.create({
        likedBy: user._id,
        tweet: tweetId,
        comment: undefined,
        video: undefined,
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { createdTweetLike: createdTweetLike },
                "Tweet Like Toggled"
            )
        );
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const user = req.user;

    // aggregate pipeline
    const requiredVideo = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(user._id),
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "likedBy",
                as: "videos", // this refrence same
                pipeline: [
                    {
                        $match: {
                            comment: undefined,
                            tweet: undefined,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                likedVideos: "$videos.video", // this refrence same
            },
        },
        {
            $project: {
                likedVideos: 1,
            },
        },
    ]);

    if (!requiredVideo || requiredVideo.length === 0) {
        throw new ApiError(500, "Internal error in fetching liked videos");
    }

    const likedVideos = requiredVideo[0].likedVideos;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                likedVideos: likedVideos,
            },
            "Liked Videos Fetched"
        )
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
