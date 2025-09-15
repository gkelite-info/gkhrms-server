import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    profile: { type: String, default: null },
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

userSchema.index({ organization: 1 });
userSchema.index({ reportsTo: 1 });

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
