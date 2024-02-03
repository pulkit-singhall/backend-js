import dotenv from "dotenv";
import connectDB from "./db/db.js";
import app from "./app.js";

dotenv.config();

// promise returning from database files 
connectDB.then((connectionObject) => {
    console.log(`DATABASE Connection established : ${connectionObject.connection.host}`);
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at ${process.env.PORT}`);
    });
}).catch((error) => {
    console.log(`DATABASE Connection failed : ${error}`);
});