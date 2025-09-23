import express from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";
import mongoose from "mongoose";
import logger from "./Utils/Logger.js";
import errorHandler from "./Middlewares/errorHandler.js";
import AuthRoute from "./Routes/Auth.route.js";
import AttendanceRoute from "./Routes/Attendance.route.js";

const app = express();
const PORT = process.env.PORT || 9999;

app.use(express.json());
app.use(helmet());
app.use(errorHandler);

app.use(
  cors({
    origin: "*",
  })
);

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`GK Hrms running on port ${PORT}`);
    });
  })
  .catch((e) => logger.error("Mongo connection error", e));

app.get("/", async (req, res) => {
  return res.status(200).json({ message: "Hello from gk hrms" });
});

app.use("/auth", AuthRoute);
app.use("/attendance", AttendanceRoute);
