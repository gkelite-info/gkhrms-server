import AttendanceModel from "../Modals/AttendanceModal.js";

const getTodayDate = () => {
  return new Date().toISOString().slice(0, 10);
};
export const checkIn = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = getTodayDate();
    const now = new Date();

    // Cutoff time (10:30 AM)
    const cutoff = new Date(`${today}T10:30:00`);

    // if (now < cutoff) {
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
        .json({ message: "Already checked in. Please checkout first." });
    }

    attendance.logs.push({ type: "checkin", time: now });
    await attendance.save();

    res.json({ message: "Checked in successfully", attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = getTodayDate();
    const now = new Date();

    const attendance = await AttendanceModel.findOne({
      employeeId,
      date: today,
    });
    if (!attendance) {
      return res
        .status(400)
        .json({ message: "No attendance found. Please check-in first." });
    }

    const lastLog = attendance.logs[attendance.logs.length - 1];
    if (!lastLog || lastLog.type !== "checkin") {
      return res
        .status(400)
        .json({ message: "Cannot checkout without a check-in." });
    }

    attendance.logs.push({ type: "checkout", time: now });
    await attendance.save();

    res.json({ message: "Checked out successfully", attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
        lastCheckIn = new Date(log.time);
      } else if (log.type === "checkout" && lastCheckIn) {
        const checkoutTime = new Date(log.time);
        totalMinutes += Math.floor((checkoutTime - lastCheckIn) / (1000 * 60));
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
