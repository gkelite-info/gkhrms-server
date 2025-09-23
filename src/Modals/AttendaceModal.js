import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        organization: { type: String, required: true },
        date: { type: Date, required: true },
        punches: [
            {
                type: { type: String, enum: ["IN", "OUT"], required: true },
                time: { type: Date, required: true },
            },
        ],
        totalHours: { type: Number, default: 0 },
    },
    { timestamps: true }
);


attendanceSchema.index({ user: 1, date: 1, organization: 1 }, { unique: true });

const AttendanceModel = mongoose.model("Attendance", attendanceSchema);
export default AttendanceModel;
