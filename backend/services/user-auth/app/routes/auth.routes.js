import express from "express";
import {signUp, signIn} from "../controllers/auth.controller.js";
import {verifySignUp} from "../middlewares/index.js";

const router = express.Router();

// Signup Client Route
router.post(
    "/signup",
    verifySignUp,
    signUp,
);

// Signin Route
router.post(
    "/signin",
    signIn,
);

export default router;