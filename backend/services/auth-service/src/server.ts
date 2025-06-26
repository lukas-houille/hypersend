import dotenv from "dotenv";
dotenv.config();
import express from "express";
import {authRoutes} from "./routes/auth";
import {userRoutes} from "./routes/user";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/", userRoutes);

// Protected route example

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});