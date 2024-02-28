import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { limit } from "./constants.js"
import { userRoute } from "./routes/user.routes.js";
import { tweetRoute } from "./routes/tweet.routes.js";
import { videoRoute } from "./routes/video.routes.js";
import { commentRoute } from "./routes/comment.routes.js"
import { playlistRoute } from "./routes/playlist.routes.js";
import { likeRouter } from "./routes/like.routes.js";
import { subscriptionRoute } from "./routes/subscription.routes.js";
import { dashboardRoute } from "./routes/dashboard.routes.js";

dotenv.config();

// creation of app 
const app = express();


// middleware / configurations
// cross origin resource sharing 
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true,        
    }
));  

// data modifications
// data coming from json
app.use(express.json({
    limit: limit,
}));

// data coming from URL
app.use(express.urlencoded({
    extended: true, // for nested objects
    limit: limit,
}));

// public assets like files, pdfs, images etc
app.use(express.static("public"));

// cookies 
app.use(cookieParser());


// routes
app.use("/api/v1/users", userRoute);
app.use("/api/v1/tweets", tweetRoute);
app.use("/api/v1/videos", videoRoute);
app.use("/api/v1/comments", commentRoute);
app.use("/api/v1/playlists", playlistRoute);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/subscriptions", subscriptionRoute);
app.use("/api/v1/dashboard", dashboardRoute);

export default app;