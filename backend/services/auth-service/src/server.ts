import dotenv from "dotenv";
dotenv.config();
import express from "express";
import {authRoutes} from "./routes/auth";
import {userRoutes} from "./routes/user";
import cors from "cors";
import cookieParser from 'cookie-parser';

export const JWT_SECRET = process.env.JWT_SECRET? process.env.JWT_SECRET : "default_secret_key";

const app = express();

app.use(cors({
    origin: "http://localhost:3000", // your frontend URL
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/", userRoutes);

// Protected route example

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});