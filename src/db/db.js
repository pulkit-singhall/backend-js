import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

dotenv.config();

// connecting to the database 
const connectDB = new Promise((resolve, reject) => {
    try {
        const connectionObject = mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        resolve(connectionObject);
    } catch (error) {
        reject(error);
    }
})

export default connectDB;