import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const lower = Number(limit) * (Number(page) - 1);
    const upper = Number(lower) + Number(limit);

    if (!videoId || videoId.trim() === "") {
        throw new ApiError(400, "Video Id is required");
    }

    // aggregation pipeline
    const comments = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
            },
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "videoComments",
            },
        },
        {
            $project: {
                videoComments: 1,
            },
        },
    ]);

    if (!comments || comments.length === 0) {
        throw new ApiError(400, "Wrong Video Id");
    }

    const videoComments = comments[0].videoComments; // another array

    if (page < 1) {
        throw new ApiError(400, "Wrong Query Parameters");
    }

    const paginatedComments = videoComments.slice(lower, upper);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { paginatedComments: paginatedComments },
                "Paginated comments fetched"
            )
        );
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    const user = req.user;

    if (!videoId || videoId.trim() === "") {
        throw new ApiError(400, "Video Id is required");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment Content is required");
    }

    const videoTo = await Video.findById(videoId);

    if (!videoTo) {
        throw new ApiError(401, "Wrong Video Id");
    }

    const newComment = await Comment.create({
        content: content,
        video: videoTo._id,
        owner: user._id,
    });

    if (!newComment) {
        throw new ApiError(500, "Internal Error in Commenting");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                newComment: newComment,
            },
            "Comment Added"
        )
    );
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const user = req.user;
    const { newContent } = req.body;

    if (!commentId || commentId.trim() === "") {
        throw new ApiError(400, "Comment Id is required");
    }

    if (!newContent || newContent.trim() === "") {
        throw new ApiError(400, "Comment Content is required");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(400, "Wrong Comment Id");
    }

    const owner = comment.owner;

    if (!user._id.equals(owner)) {
        throw new ApiError(402, "User cant delete other comments");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: newContent,
            },
        },
        {
            new: true,
        }
    );

    if (!updatedComment) {
        throw new ApiError(500, "Internal error in updating the comment");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                updatedComment: updatedComment,
            },
            "Comment Updated"
        )
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const user = req.user;

    if (!commentId || commentId.trim() === "") {
        throw new ApiError(400, "Comment Id is required");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(400, "Wrong Comment Id");
    }

    const owner = comment.owner;

    if (!user._id.equals(owner)) {
        throw new ApiError(402, "User cant delete other comments");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
        throw new ApiError(500, "Internal error in deleting the comment");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                deletedComment: deletedComment,
            },
            "Comment Deleted"
        )
    );
});

export { getVideoComments, addComment, updateComment, deleteComment };
