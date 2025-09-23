import express from "express";
import {
  checkIn,
  checkOut,
  getAttendance,
  getWorkedHours,
} from "../Controllers/Attendace.Controller.js";

const router = express.Router();

router.post("/checkin", checkIn);

router.post("/checkout", checkOut);

router.get("/:employeeId/:date", getAttendance);
router.get("/:employeeId/:date/worked-hours", getWorkedHours);
export default router;
