import express from "express";
import { clientRoute } from "./routes/client.route";

const app = express();

app.use(express.json());

app.use("/api/client-service/", clientRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Client Service is running on port ${PORT}`);
});