import dotenv from "dotenv";
dotenv.config();
import express from "express";
import {authRoutes} from "./routes/auth";
import {userRoutes} from "./routes/user";
import cors from "cors";

const app = express();

app.use(cors({
    origin: "http://localhost:3000", // your frontend URL
    credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/", userRoutes);

// Protected route example

const PORT = process.env.PORT || 3322;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});