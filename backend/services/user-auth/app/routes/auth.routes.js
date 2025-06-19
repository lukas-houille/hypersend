import express from "express";
import {signUp, signIn} from "../controllers/auth.controller.js";
import {verifySignUp, authJwt} from "../middlewares/index.js";

const router = express.Router();

const authorizedAccess = (req, res) => {
    res.status(200).json({ message: "Authentication OK" });
};

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