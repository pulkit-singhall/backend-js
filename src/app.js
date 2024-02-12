import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { limit } from "./constants.js"
import { userRoute } from "./routes/user.routes.js";

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
app.use('/api/users', userRoute);


export default app;