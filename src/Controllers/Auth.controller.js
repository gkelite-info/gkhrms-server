import jwt from "jsonwebtoken";
import UserModel from "../Modals/UserModal.js"

export const signup = async (req, res) => {
    const { name, email, password } = req.body
    const user = new UserModel({ name, email, password })
    await user.save()
    return res.status(201).json({ message: "User Created..!" })
}

export const login = async (req, res) => {
    const { email, password } = req.body
    const user = await UserModel.findOne(email)
    if (!user) return res.status(404).json({ message: "User Not Found" })
}