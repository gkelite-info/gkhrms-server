import express from "express";
import { authentication } from "../Middlewares/AuthMiddleware.js";
import { addPunch, getUserAttendance } from "../Controllers/Attendace.controller.js";

const attendanceRouter = express.Router();

attendanceRouter.post("/punch", authentication, addPunch);
attendanceRouter.get("/", authentication, getUserAttendance)

export default attendanceRouter;
