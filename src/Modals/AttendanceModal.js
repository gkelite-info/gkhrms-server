import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    // shiftStart: {
    //   type: String,
    //   default: "10:30",
    // },
    // shiftEnd: {
    //   type: String,
    //   default: "19:30",
    // },
    logs: [
      {
        type: {
          type: String,
          enum: ["checkin", "checkout"],
          required: true,
        },
        time: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const AttendanceModel = mongoose.model("Attendances", attendanceSchema);
export default AttendanceModel;
