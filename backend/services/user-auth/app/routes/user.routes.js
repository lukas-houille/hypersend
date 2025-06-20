import express from "express";
import {authJwt} from "../middlewares/index.js";

const authorizedAccess = (req, res) => {
    res.status(200).json({message: "Authentication successful.", user: {email: req.user.email, type: req.user.type}});
};

const router = express.Router();

// Client Route
router.get("/client/*splat", [authJwt.verifyToken, authJwt.isClient], authorizedAccess);

// Driver Route
router.get("/driver/*splat", [authJwt.verifyToken, authJwt.isDriver], authorizedAccess);

// Restaurant Route
router.get("/restaurant/*splat", [authJwt.verifyToken, authJwt.isRestaurant], authorizedAccess);

// Landing Page Route
router.get("/", (req, res) => {
    res.status(200).json({});
});

// Fallback Route for 404 Not Found
router.get("/*splat", (req, res) => {
    res.status(404).json({message: "Not found."});
});

export default router;