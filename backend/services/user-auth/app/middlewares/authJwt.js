// app/middlewares/authJwt.js
import jwt from "jsonwebtoken";
import db from "../models/index.js";
import authConfig from "../config/auth.config.js";

const Client = db.client;

const verifyToken = (req, res, next) => {
    const token = req.headers["x-access-token"] || req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ message: "No token provided!" });
    }

    const actualToken = token.startsWith("Bearer ")
        ? token.slice(7, token.length)
        : token;

    jwt.verify(actualToken, authConfig.secret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized!" });
        }
        req.JWTEmail = decoded.email;
        req.JWType = decoded.type;
        next();
    });
};

// Middleware to check if the user is a client

const isClient = async (req, res, next) => {
    try {
        // Check if the user is a client
        if (!req.JWType || req.JWType !== "client") {
            return res.status(403).json({ message: "Unauthorized" });
        }
        const client = await Client.findOne({
            where: { email: req.JWTEmail },
        });
        if (!client) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Middleware to check if the user is a driver

const isDriver = async (req, res, next) => {
    try {
        // Check if the user is a driver
        if (!req.JWType || req.JWType !== "driver") {
            return res.status(403).json({ message: "Unauthorized" });
        }
        const driver = await db.driver.findOne({
            where: { email: req.JWTEmail },
        });
        if (!driver) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Middleware to check if the user is a restaurant

const isRestaurant = async (req, res, next) => {
    try {
        // Check if the user is a restaurant
        if (!req.JWType || req.JWType !== "restaurant") {
            return res.status(403).json({ message: "Unauthorized" });
        }
        const restaurant = await db.restaurant.findOne({
            where: { email: req.JWTEmail },
        });

        if (!restaurant) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const authJwt = {
    verifyToken,
    isClient,
    isDriver,
    isRestaurant
};

export default authJwt;