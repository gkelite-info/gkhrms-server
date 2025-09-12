import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        role: {
            type: String, enum: ["Employee", "Hr", "Manager", "CEO", "Super Admin"], default: "Employee"
        },
        // hr: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "User",
        //     required: true,
        // },
    },
    { timestamps: true }
)

const UserModel = mongoose.model("Users", userSchema)
export default UserModel
