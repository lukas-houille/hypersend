// app/controllers/auth.controller.js
import db from "../models/index.js";
import authConfig from "../config/auth.config.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const signUp = async (req, res) => {
    try {
        const userType = req.body.type;
        // check user type
        const UserModel = db.mymodels[userType];
        if (!UserModel) {
            return res.status(500).json({message: "Invalid user type!"});
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
        // Determine user type based on JWT payload
        const userType = req.body.type;
        const UserModel = db.mymodels[userType];
        if (!UserModel) {
            return res.status(500).json({message: "Invalid user type!"});
        }
        // Find user by email
        const user = await UserModel.findOne({
            where: {email: req.body.email},
        });
        if (!user) {
            return res.status(401).json({accessToken: null, message: "Invalid email or password !"});
        }

        // Check password
        const passwordIsValid = await bcrypt.compare(req.body.password, user.password_hash);
        if (!passwordIsValid) {
            return res.status(401).json({accessToken: null, message: "Invalid email or password !"});
        }
        // Create JWT token
        const token = jwt.sign({email: user.email, userType: userType}, authConfig.secret, {
            expiresIn: 86400, // 24 hours
        });

        // Respond with user details and token

        res.status(200).json({
            email: user.email,
            userType: userType,
            accessToken: token,
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};