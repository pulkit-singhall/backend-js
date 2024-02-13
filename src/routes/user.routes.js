import express from "express";
import { registerUser, loginUser} from "../controllers/user.controller.js";

const userRoute = express.Router();

userRoute.route('/register').get(registerUser);
userRoute.route('/login').get(loginUser);

// another way
// userRoute.get('/login', loginUser); 

export {userRoute};