import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        role: {
            type: String, enum: ["Employee", "Hr", "Manager", "CEO", "Super Admin"], default: "Employee"
        },
        organization: { type: String, default: "", },
        hrId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, },
        managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, },
        teamLeaderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, },
    },
    { timestamps: true }
)

const UserModel = mongoose.model("Users", userSchema)
export default UserModel
