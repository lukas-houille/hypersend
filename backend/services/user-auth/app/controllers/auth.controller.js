import db from "../models/index.js";
import authConfig from "../config/auth.config.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const signUp = async (req, res) => {
    try {
        const UserModel = db.mymodels[req.body.type];
        const user = await UserModel.findOne({
            where: { email: req.body.email },
        });
        if (user) {
            return res.status(400).json({"message": "User already exists!"});
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        // Create user
        await UserModel.create({
             email: req.body.email,
             password_hash: hashedPassword,
        });
        res.status(201).json({message: "Registered successfully!"});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const signIn = async (req, res) => {
    try {
        const UserModel = db.mymodels[req.body.type];
        // Check if user exists
        const user = await UserModel.findOne({
            where: { email: req.body.email },
        });
        if (!user) {
            return res.status(401).json({message: "Invalid email or password !"});
        }
        // Check password
        const passwordIsValid = await bcrypt.compare(req.body.password, user.password_hash);
        if (!passwordIsValid) {
            return res.status(401).json({Òmessage: "Invalid email or password !"});
        }
        // Create JWT token
        const token = jwt.sign({email: user.email, type: req.body.type}, authConfig.secret, {
            expiresIn: 86400, // 24 hours
        });
        // Respond with user details and token
        res.status(200).json({
            email: user.email,
            type: req.body.type,
            accessToken: token,
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};