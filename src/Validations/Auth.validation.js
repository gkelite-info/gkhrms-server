
import Joi from "joi";

export const signupSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("Employee", "Hr", "Manager", "CEO", "Super Admin").default("Employee"),
}).unknown(true)

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});