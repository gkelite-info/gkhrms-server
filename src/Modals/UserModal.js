import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["Employee", "Hr", "Manager", "CEO", "Super Admin", "Team Leader"],
      default: "Employee",
    },
    organization: { type: String, default: "" },
    reportsTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("Users", userSchema);
export default UserModel;
