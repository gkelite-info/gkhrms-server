import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

import LeaveModel from "../Modals/LeavesModal.js";
// 68c7edd7bbb8d004648e74cf
export const applyLeave = async (req, res) => {
    const { id, organization } = req;
    const { startDate, endDate, type, reason } = req.body;
    const leave = await LeaveModel.create({
        user: id,
        organization,
        startDate,
        endDate,
        type,
        reason,
    });

    return res.status(201).json(leave);
}

export const deleteUserLeaves = async (req, res) => {
    const { leaveid } = req.params
    const { id } = req

    const leave = await LeaveModel.findById(leaveid)
    if (!leave) return res.status(404).json({ message: "Leave not found" })

    if (leave.user?.toString() !== id)
        return res.status(403).json({ message: "You con't delete another person data" })

    await LeaveModel.findByIdAndDelete(leaveid)
    return res.status(204).json({ message: "Leave Deleted..!" })

}

export const getUserLeaves = async (req, res) => {
    const { id, organization } = req;
    const { filter } = req.query;

    let start, end;
    if (filter === "today") {
        start = dayjs().tz("Asia/Kolkata").startOf("day").toDate();
        end = dayjs().tz("Asia/Kolkata").endOf("day").toDate();
    } else if (filter === "month") {
        start = dayjs().tz("Asia/Kolkata").startOf("month").toDate();
        end = dayjs().tz("Asia/Kolkata").endOf("month").toDate();
    }

    const leaves = await LeaveModel.find({
        user: id,
        organization,
        startDate: { $lte: end },
        endDate: { $gte: start },
    }).populate("approvedBy", "name role profile");

    return res.status(200).json(leaves);
}


// approved or rejected leaves
export const updateLeaveStatus = async (req, res) => {
    const { leaveId } = req.params;
    const { id } = req;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status))
        return res.status(400).json({ message: "Invalid status" });

    const leave = await LeaveModel.findByIdAndUpdate(
        leaveId,
        { status, approvedBy: id },
        { new: true }
    );

    if (!leave)
        return res.status(404).json({ message: "Leave not found" });

    return res.status(200).json(leave);
}