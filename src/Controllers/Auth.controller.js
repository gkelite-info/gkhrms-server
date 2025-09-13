import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../Modals/UserModal.js"
import { loginSchema, signupSchema } from "../Validations/Auth.validation.js";

export const signup = async (req, res) => {

    const { error } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name, email, password } = req.body
    if (!email || !password || !name)
        return res.status(400).json({ message: "All fields are required" });

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPass = await bcrypt.hash(password, 10);
    const user = new UserModel({ name, email, password: hashedPass })
    await user.save()
    return res.status(201).json({ message: "User Created..!" })
}

export const login = async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body
    const user = await UserModel.findOne({ email })
    if (!user) return res.status(404).json({ message: "User Not Found" })

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "In-Correct Password" })

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET);
    return res.status(200).json({ token })
}

export const profile = async (req, res) => {
    const { id } = req
    const user = await UserModel.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User Not Found" })
    return res.status(200).json(user)
}


// added hr to ceo
export const addedHr = async (req, res) => {
    const { id } = req
    const { name, email, password, role } = req.body

    const { error } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const mainHead = await UserModel.findById(id)
    if (!mainHead) return res.status(200).json({ message: "Organization not found" })
    const hashedPass = await bcrypt.hash(password, 10);

    const emp = new UserModel({
        name, email, role,
        organization: mainHead.organization, password: hashedPass
    })

    await emp.save()
    return res.status(201).json({ message: "Hr created" })


}