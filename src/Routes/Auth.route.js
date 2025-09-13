import express from "express"
import { addedHr, login, profile, signup } from "../Controllers/Auth.controller.js"
import { authentication } from "../Middlewares/AuthMiddleware.js"

const router = express.Router()

router.post('/sign-up', signup)
router.post('/login', login)
router.get("/profile", authentication, profile)

// super admin or ceo added
router.post("/add-hr", authentication, addedHr)
export default router