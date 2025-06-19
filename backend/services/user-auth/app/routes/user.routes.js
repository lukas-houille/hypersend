// app/routes/user.routes.js
import express from "express";
import { authJwt } from "../middlewares/index.js";

const authorizedAccess = (req, res) => {
    res.status(200).json({ message: "Authentication successful." });
};

const router = express.Router();

// Public Route
router.get("/", authorizedAccess);

// Client Route
router.get(
    "/client",
    [authJwt.verifyToken, authJwt.isClient],
    authorizedAccess
);

// Driver Route
router.get(
    "/driver",
    [authJwt.verifyToken, authJwt.isDriver],
    authorizedAccess
);

// Restaurant Route
router.get(
    "/restaurant",
    [authJwt.verifyToken, authJwt.isRestaurant],
    authorizedAccess
);
export default router;