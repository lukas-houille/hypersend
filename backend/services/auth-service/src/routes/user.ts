import express from "express";
import {authMiddleware} from "../middleware/auth";

export const userRoutes = express.Router();

userRoutes.get("/", async (req, res) => {
    res.status(200).send({})
})

userRoutes.get("/client/*splat",
    authMiddleware(["client"]),
    async (req, res) => {
        res.status(200).send({message: "Client route is working"})
    })

userRoutes.get("/driver/*splat",
    authMiddleware(["driver"]),
    async (req, res) => {
        res.status(200).send({
            message: "Driver route is working"
        })
    })
userRoutes.get("/restaurant/*splat",
    authMiddleware(["restaurant"]),
    async (req, res) => {
        res.status(200).send({
            message: "Restaurant route is working"
        })
    })

userRoutes.get("/*splat",
    async (req, res) => {
        res.status(404).json({message: "Not found."});
    });