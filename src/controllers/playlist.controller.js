import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, isPrivate } = req.body;
    const user = req.user;

    if (!name || name.trim() === "") {
        throw new ApiError(400, "Playlist Name is required");
    }

    const createdPlaylist = await Playlist.create({
        name: name,
        description: description,
        owner: user._id,
        isPrivate: Number(isPrivate),
    });

    if (!createdPlaylist) {
        throw new ApiError(500, "Internal error in creating the playlist");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                createdPlaylist: createdPlaylist,
            },
            "Playlist created"
        )
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username || username.trim() === "") {
        throw new ApiError(400, "User name is required");
    }

    const user = await User.findOne({
        username,
    });

    if (!user) {
        throw new ApiError(401, "Invalid Username");
    }

    // aggregate
    const playlists = await User.aggregate([
        {
            $match: {
                username: username,
            },
        },
        {
            $lookup: {
                from: "playlists",
                localField: "_id",
                foreignField: "owner",
                as: "userPlaylists",
                pipeline: [
                    {
                        $match: {
                            isPrivate: 0,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                userPlaylists: 1,
            },
        },
    ]);

    if (!playlists || playlists.length === 0) {
        throw new ApiError(500, "Internal error in fetching playlists");
    }

    const userPlaylists = playlists[0].userPlaylists; // array

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                userPlaylists: userPlaylists,
            },
            "User playlists fetched successfully"
        )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const user = req.user;

    if (!playlistId || playlistId.trim() === "") {
        throw new ApiError(400, "Playlist ID is required");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(401, "Wrong Playlist ID");
    }

    const privacy = playlist.isPrivate;
    const owner = playlist.owner;

    if (privacy === 1) {
        if (!user._id.equals(owner)) {
            throw new ApiError(405, "User cant get private playlists");
        }
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                playlist: playlist,
            },
            "Playlist fetched successfully"
        )
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params;
    const user = req.user;

    if (
        !playlistId ||
        !videoId ||
        playlistId.trim() === "" ||
        videoId.trim() === ""
    ) {
        throw new ApiError(400, "Fields are required");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(400, "Wrong playlist ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "Wrong video ID");
    }

    const owner = playlist.owner;

    if (!user._id.equals(owner)) {
        throw new ApiError(401, "User cant add video in the other playlist");
    }

    const videos = playlist.videos;
    if (videos.includes(videoId)) {
        throw new ApiError(405, "Video is already present in the playlist");
    }

    videos.push(videoId);
    playlist.videos = videos;
    playlist.save({ validateBeforeSave: false });

    return res
        .status(201)
        .json(new ApiResponse(201, {}, "Video added in the playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params;
    const user = req.user;

    if (
        !playlistId ||
        !videoId ||
        playlistId.trim() === "" ||
        videoId.trim() === ""
    ) {
        throw new ApiError(400, "Fields are required");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(400, "Wrong playlist ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "Wrong video ID");
    }

    const owner = playlist.owner;

    if (!user._id.equals(owner)) {
        throw new ApiError(
            401,
            "User cant remove video from the other playlist"
        );
    }

    const videos = playlist.videos;
    if (!videos.includes(videoId)) {
        throw new ApiError(405, "Video is not present in the playlist");
    }

    let videoIndex = videos.indexOf(videoId);
    videos.splice(videoIndex, 1);

    playlist.videos = videos;
    playlist.save({ validateBeforeSave: false });

    return res
        .status(201)
        .json(new ApiResponse(201, {}, "Video removed from the playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const user = req.user;

    if (!playlistId || playlistId.trim() === "") {
        throw new ApiError(400, "Playlist ID is required");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(401, "Wrong Playlist ID");
    }

    const owner = playlist.owner;

    if (!user._id.equals(owner)) {
        throw new ApiError(404, "User cant delete other playlists");
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    return res.status(203).json(
        new ApiResponse(
            203,
            {
                deletedPlaylist: deletedPlaylist,
            },
            "Playlist deleted successfully"
        )
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    const user = req.user;

    if (!playlistId || playlistId.trim() === "") {
        throw new ApiError(400, "Playlist ID is required");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(401, "Wrong Playlist ID");
    }

    const owner = playlist.owner;

    if (!user._id.equals(owner)) {
        throw new ApiError(404, "User cant update other playlists");
    }

    let newName = playlist.name;
    let newDescription = playlist.description;
    if (name && name.trim() !== "") {
        newName = name;
    }
    if (description && description.trim() !== "") {
        newDescription = description;
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: newName,
                description: newDescription,
            },
        },
        {
            new: true,
        }
    );

    if (!updatedPlaylist) {
        throw new ApiError(500, "Internal error in updating the playlist");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                updatedPlaylist: updatedPlaylist,
            },
            "Playlist updated successfully"
        )
    );
});

const updatePrivateStatus = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const user = req.user;

    if (!playlistId || playlistId.trim() === "") {
        throw new ApiError(400, "Playlist ID is required");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(401, "Wrong Playlist ID");
    }

    const owner = playlist.owner;

    if (!user._id.equals(owner)) {
        throw new ApiError(
            404,
            "User cant change privacy status of other playlists"
        );
    }

    const isPrivate = playlist.isPrivate;

    const changedStatus = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                isPrivate: 1 - isPrivate,
            },
        },
        { new: true }
    );

    if (!changedStatus) {
        throw new ApiError(500, "Internal error in updating the playlist privacy status");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                updatedPrivacyStatus: changedStatus.isPrivate,
            },
            "Playlist Privacy status updated successfully"
        )
    );
});

export {
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    removeVideoFromPlaylist,
    addVideoToPlaylist,
    getPlaylistById,
    getUserPlaylists,
    updatePrivateStatus,
};
