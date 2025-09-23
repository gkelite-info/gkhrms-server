import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

import AttendanceModel from "../Modals/AttendaceModal.js";

export const addPunch = async (req, res) => {
    const { id, organization } = req;
    const { type } = req.body;

    const today = dayjs().tz("Asia/Kolkata").startOf("day").toDate();
    let attendance = await AttendanceModel.findOne({ user: id, date: today, organization });

    const now = new Date();

    if (!attendance) {
        attendance = await AttendanceModel.create({
            user: id,
            organization,
            date: today,
            punches: [{ type, time: now }],
        });
    } else {
        attendance.punches.push({ type, time: now });
    }

    let totalMs = 0;
    const punches = attendance.punches;
    for (let i = 0; i < punches.length; i += 2) {
        const inPunch = punches[i];
        const outPunch = punches[i + 1];
        if (inPunch && outPunch && inPunch.type === "IN" && outPunch.type === "OUT") {
            totalMs += outPunch.time - inPunch.time;
        }
    }

    attendance.totalHours = totalMs / (1000 * 60 * 60);

    await attendance.save();
    const response = {
        ...attendance.toObject(),
        date: dayjs(attendance.date).tz("Asia/Kolkata").format(),
        punches: attendance.punches.map(p => ({
            ...p.toObject(),
            time: dayjs(p.time).tz("Asia/Kolkata").format(),
        })),
    };
    return res.status(200).json({ attendance: response });

    // 15:42:42 − 15:40:39 = 2 minutes 3 seconds
    // Convert seconds:  2×60+3=123 seconds
    // Convert to hours: 123÷3600≈0.0341667 hours

}

export const getUserAttendance = async (req, res) => {
    const { id, organization } = req;
    const { filter } = req.query;

    let start, end;

    if (filter === "today") {
        start = dayjs().tz("Asia/Kolkata").startOf("day").toDate();
        end = dayjs().tz("Asia/Kolkata").endOf("day").toDate();
    } else if (filter === "month") {
        start = dayjs().tz("Asia/Kolkata").startOf("month").toDate();
        end = dayjs().tz("Asia/Kolkata").endOf("month").toDate();
    } else {
        return res.status(400).json({ success: false, message: "Invalid filter. Use 'today' or 'month'" });
    }

    const attendance = await AttendanceModel.find({
        user: id,
        organization,
        date: { $gte: start, $lte: end },
    }).sort({ date: -1 });


    const attendanceIST = attendance.map(att => {
        const attObj = att.toObject();
        return {
            ...attObj,
            date: dayjs(attObj.date).tz("Asia/Kolkata").format(),
            punches: attObj.punches.map(p => ({
                ...p,
                time: dayjs(p.time).tz("Asia/Kolkata").format()
            }))
        };
    });

    return res.status(200).json({ attendance: attendanceIST });

}