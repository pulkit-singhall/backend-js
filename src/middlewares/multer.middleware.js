/*
this is used to store the files (pdfs, videos, photos) temporarily on our local server and then
upload these files on the cloud storage.
PART 1 -> get files from frontend and store them on local server temporarily using multer.
PART 2 -> upload files from local server to the cloud using cloudinary.
PART 3 -> delete files from local server 
*/

import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, ".../public/temp");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });


export default upload;