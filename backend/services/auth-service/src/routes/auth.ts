import express from "express";
import {checkSignRequest} from "../middleware/auth";
import {signUp, signIn} from "../controller/auth.controller";

export const authRoutes = express.Router();

authRoutes.post(
    "/signup",
    checkSignRequest(),
    signUp()
);

authRoutes.post(
    "/signin",
    checkSignRequest(),
    signIn()
);