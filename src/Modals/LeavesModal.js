import mongoose from "mongoose";

const LeaveSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        organization: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        type: {
            type: String,
            enum: ["Sick Leave", "Casual Leave", "Earned Leave", "Unpaid Leave"],
            required: true,
        },
        reason: { type: String, required: true },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

const LeaveModel = mongoose.model("Leave", LeaveSchema);
export default LeaveModel;
