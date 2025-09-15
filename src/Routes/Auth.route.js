import express from "express";
import {
    addedHr,
    getEmpSepOrganization,
    hierarchyEmps,
    login,
    profile,
    signup,
} from "../Controllers/Auth.controller.js";
import { authentication } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.post("/sign-up", signup);
router.post("/login", login);
router.get("/profile", authentication, profile);
router.get("/all-emp/:organization", authentication, getEmpSepOrganization);

// super admin or ceo added
router.post("/add-hr/:id", addedHr);
router.get("/hierarchy/:organization", hierarchyEmps)
export default router;
