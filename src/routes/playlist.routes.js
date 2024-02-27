import express from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import {
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    removeVideoFromPlaylist,
    addVideoToPlaylist,
    getPlaylistById,
    updatePrivateStatus,
    getUserPlaylists,
} from "../controllers/playlist.controller.js";

const playlistRoute = express.Router();

playlistRoute.route("/create-playlist").post(verifyUser, createPlaylist);
playlistRoute
    .route("/update-private-status/:playlistId")
    .patch(verifyUser, updatePrivateStatus);
playlistRoute
    .route("/update-playlist/:playlistId")
    .patch(verifyUser, updatePlaylist);
playlistRoute
    .route("/delete-playlist/:playlistId")
    .delete(verifyUser, deletePlaylist);
playlistRoute
    .route("/get-playlist/:playlistId")
    .get(verifyUser, getPlaylistById);
playlistRoute.route("/get-user-playlists/:username").get(getUserPlaylists);
playlistRoute
    .route("/add-video/:playlistId/:videoId")
    .patch(verifyUser, addVideoToPlaylist);
playlistRoute
    .route("/remove-video/:playlistId/:videoId")
    .patch(verifyUser, removeVideoFromPlaylist);

export { playlistRoute };
