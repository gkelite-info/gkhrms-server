import express from "express";
import { authentication } from "../Middlewares/AuthMiddleware.js";
import { applyLeave, deleteUserLeaves, getUserLeaves, updateLeaveStatus } from "../Controllers/Leave.controller.js";

const leavesRouter = express.Router();

leavesRouter.post("/", authentication, applyLeave)
leavesRouter.get("/", authentication, getUserLeaves)
leavesRouter.delete("/:leaveid", authentication, deleteUserLeaves)
leavesRouter.patch("/updated/:leaveId", authentication, updateLeaveStatus)

export default leavesRouter;
