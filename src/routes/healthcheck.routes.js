import express from "express";
import { healthcheck } from "../controllers/healthcheck.controller.js";

const healthcheckRoute = express.Router();

healthcheckRoute.route("/").get(healthcheck);

export {
    healthcheckRoute,
}