import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    uploadFilesToCloud,
    deleteVideoFileFromCloud,
    deleteImageFileFromCloud,
} from "../utils/cloudinary.js";

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId || videoId.trim() === "") {
        throw new ApiError(400, "Video Id is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, "Video Id is wrong");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                video: video,
            },
            "Video Fetched Successfully"
        )
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const user = req.user;

    if (!videoId || videoId.trim() === "") {
        throw new ApiError(400, "Video Id is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, "Wrong Video Id");
    }

    const owner = video.owner;

    if (!user._id.equals(owner)) {
        throw new ApiError(402, "User cant delete other videos");
    }

    const oldThumbnailPublicId = video.thumbnailPublicId;
    const oldVideoFilePublicId = video.videoFilePublicId;

    const thumbnailDeleteResponse =
        await deleteImageFileFromCloud(oldThumbnailPublicId);
    if (!thumbnailDeleteResponse) {
        throw new ApiError(500, "Thumbnail not deleted");
    }

    const videoFileDeleteResponse =
        await deleteVideoFileFromCloud(oldVideoFilePublicId);
    if (!videoFileDeleteResponse) {
        throw new ApiError(500, "Video File not deleted");
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
        throw new ApiError(500, "Internal Error in deleting the video");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                deletedVideo: deletedVideo,
            },
            "Video deleted successfully"
        )
    );
});

const createVideo = asyncHandler(async (req, res) => {
    const user = req.user;
    const { title, description, duration } = req.body;
    const files = req.files;

    if (
        [title, description, duration].some((field) => {
            if (!field) {
                return true;
            }
            if (field.trim() === "") {
                return true;
            }
        })
    ) {
        throw new ApiError(402, "All Fields are required");
    }

    let thumbnailResponseUrl = "";
    let thumbnailResponsePublicId = "";

    let videoFileResponseUrl = "";
    let videoFileResponsePublicId = "";

    if (files && Array.isArray(files.videoFile) && files.videoFile.length > 0) {
        const localPathVideoFile = files.videoFile[0].path;
        let responseVideoFile = await uploadFilesToCloud(localPathVideoFile);
        videoFileResponsePublicId = responseVideoFile.public_id;
        videoFileResponseUrl = responseVideoFile.url;
    } else {
        throw new ApiError(403, "Video file is required");
    }

    if (files && Array.isArray(files.thumbnail) && files.thumbnail.length > 0) {
        const localPathThumbnail = files.thumbnail[0].path;
        let responseThumbnail = await uploadFilesToCloud(localPathThumbnail);
        thumbnailResponsePublicId = responseThumbnail.public_id;
        thumbnailResponseUrl = responseThumbnail.url;
    } else {
        throw new ApiError(403, "Thumbnail is required");
    }

    const createdVideo = await Video.create({
        videoFile: videoFileResponseUrl,
        videoFilePublicId: videoFileResponsePublicId,
        title: title,
        duration: Number(duration),
        description: description,
        thumbnail: thumbnailResponseUrl,
        thumbnailPublicId: thumbnailResponsePublicId,
        owner: user._id,
    });

    if (!createdVideo) {
        throw new ApiError(500, "Internal error in creating the video");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                createdVideo: createdVideo,
            },
            "video Created Successfully"
        )
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const user = req.user;

    if (!videoId || videoId.trim() === "") {
        throw new ApiError(400, "Video Id is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, "Wrong Video Id");
    }

    const owner = video.owner;

    if (!user._id.equals(owner)) {
        throw new ApiError(
            402,
            "User cant toggle publish status of other videos"
        );
    }

    const isPublished = video.isPublished;

    const updatedPublishStatus = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: 1 - isPublished,
            },
        },
        {
            new: true,
        }
    );

    if (!updatedPublishStatus) {
        throw new ApiError(500, "Internal Error in Toggling Publish Status");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                updatedPublishStatus: updatedPublishStatus.isPublished,
            },
            "Publish Status Toggled"
        )
    );
});

const updateVideo = asyncHandler(async (req, res) => {
    const user = req.user;
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!videoId || videoId.trim() === "") {
        throw new ApiError(400, "Video Id is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, "Wrong Video Id");
    }

    const owner = video.owner;

    if (!user._id.equals(owner)) {
        throw new ApiError(402, "User cant update other videos");
    }

    let newTitle = video.title;
    let newDescription = video.description;

    if (title && title.trim() !== "") {
        newTitle = title;
    }

    if (description && description.trim() !== "") {
        newDescription = description;
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                "title": newTitle,
                "description": newDescription,
            },
        },
        {
            new: true,
        }
    );

    if (!updatedVideo) {
        throw new ApiError(500, "Internal error in updating the video");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                updatedVideo: updatedVideo,
            },
            "Video Updated Successfully"
        )
    );
});

export {
    getVideoById,
    deleteVideo,
    togglePublishStatus,
    createVideo,
    updateVideo,
};
