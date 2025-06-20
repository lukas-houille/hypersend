import express from "express";
import {signUp, signIn} from "../controllers/auth.controller.js";
import verifySignRequest from "../middlewares/verifySignRequest.js";

const router = express.Router();

// Signup Client Route
router.post(
    "/signup",
    verifySignRequest,
    signUp,
);

// Signin Route
router.post(
    "/signin",
    verifySignRequest,
    signIn,
);

export default router;