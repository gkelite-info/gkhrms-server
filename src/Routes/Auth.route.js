import express from "express"
import { signup } from "../Controllers/Auth.controller.js"

const router = express.Router()

router.post('/sign-up', signup)


export default router