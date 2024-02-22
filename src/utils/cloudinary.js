/*
this is used to upload files(pdfs, videos, photos) from the local server to the cloud storage.
PART 1 -> get files from frontend and store them on local server temporarily using multer.
PART 2 -> upload files from local server to the cloud using cloudinary.
PART 3 -> delete files from local server 
*/

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({ 
  cloud_name: `${process.env.CLOUD_NAME}`, 
  api_key: `${process.env.CLOUD_API_KEY}`, 
  api_secret: `${process.env.CLOUD_API_SECRET}`, 
});


// PART 2
const uploadFilesToCloud = async function (localFilePath) {
    try {
        if (!localFilePath) throw "Local file path does not exist!";
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", 
        });
        fs.unlinkSync(localFilePath);
        return response;
    }
    catch (error) {
        if (localFilePath) {
            fs.unlinkSync(localFilePath);   
        }
        console.log(`Error in file upload : ${error}`);
        return null;
    }
}

const deleteFilesFromCloud = async function (filePublicId) {
    try {
        const response = await cloudinary.uploader
            .destroy(filePublicId);
        return response;
    } catch (error) {
        console.log(`Error in deleting file from cloud: ${error}`);
        return null;
    }
}

export {
    uploadFilesToCloud,
    deleteFilesFromCloud,
}