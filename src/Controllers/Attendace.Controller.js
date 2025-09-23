import moment from "moment";
import AttendanceModel from "../Modals/AttendanceModal.js";

// POST /api/attendance/checkin
export const checkIn = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const now = new Date();

    const shiftStart = new Date(today + "T10:00:00");
    const graceTime = new Date(today + "T10:30:00");
    const shiftEnd = new Date(today + "T19:30:00");

    // if (now < graceTime) {
    //   return res
    //     .status(400)
    //     .json({ message: "Check-in not allowed before 10:30 AM" });
    // }

    let attendance = await AttendanceModel.findOne({ employeeId, date: today });
    if (!attendance) {
      attendance = new AttendanceModel({
        employeeId,
        date: today,
        logs: [],
      });
    }

    const lastLog = attendance.logs[attendance.logs.length - 1];

    if (lastLog && lastLog.type === "checkin") {
      return res
        .status(400)
        .json({ message: "Already checked in. Checkout first." });
    }

    if (now > shiftEnd) {
      return res
        .status(400)
        .json({ message: "Shift ended. Cannot check-in now." });
    }

    attendance.logs.push({ type: "checkin", time: now });
    await attendance.save();

    res.json({ message: "Check-in successful", attendance });
  } catch (error) {
    console.log("error", error);

    res.status(500).json({ error: error.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    const attendance = await AttendanceModel.findOne({
      employeeId,
      date: today,
    });

    if (!attendance) {
      return res.status(400).json({ message: "No check-in record found" });
    }

    const lastLog = attendance.logs[attendance.logs.length - 1];
    if (!lastLog || lastLog.type !== "checkin") {
      return res
        .status(400)
        .json({ message: "Cannot checkout without check-in" });
    }

    attendance.logs.push({ type: "checkout", time: now });
    await attendance.save();

    res.json({ message: "Checkout successful", attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get attendance logs for a date
export const getAttendance = async (req, res) => {
  try {
    const { employeeId, date } = req.params;
    const attendance = await AttendanceModel.findOne({ employeeId, date });

    if (!attendance) {
      return res.status(404).json({ message: "No attendance found" });
    }

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get worked hours for a date
export const getWorkedHours = async (req, res) => {
  try {
    const { employeeId, date } = req.params;

    const attendance = await AttendanceModel.findOne({ employeeId, date });
    if (!attendance) {
      return res.status(404).json({ message: "No attendance found" });
    }

    let totalMinutes = 0;
    let lastCheckIn = null;

    attendance.logs.forEach((log) => {
      if (log.type === "checkin") {
        lastCheckIn = moment(log.time);
      } else if (log.type === "checkout" && lastCheckIn) {
        const checkoutTime = moment(log.time);
        totalMinutes += checkoutTime.diff(lastCheckIn, "minutes");
        lastCheckIn = null;
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    res.json({
      employeeId,
      date,
      totalWorked: `${hours}h ${minutes}m`,
      totalMinutes,
      logs: attendance.logs,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
