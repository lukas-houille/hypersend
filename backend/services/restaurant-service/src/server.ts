import { Channel } from "amqplib";
import { initConnection, startConsumer } from "myrabbitconfig";
import {onRecivedMessage} from "./utils/handleMessage";
import express from "express";
import {restaurantRoute} from "./routes/restaurant";
import cors from 'cors';
const app = express();

app.use(cors({
    origin: (process.env.CORS_ORIGIN || "http://localhost:3000"),
    credentials: true, // Allow credentials to be sent
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
}));

app.use(express.json());

app.use("/api/restaurants/", restaurantRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Client Service is running on port ${PORT}`);
});

export let rabbitChannel: Channel | null = null;

initConnection((process.env.RABBITMQURL || "amqp://localhost"),"hypersend" , "restaurantService", "#.restaurant.#", (channel:Channel, queue: string) => {
    rabbitChannel = channel;
    startConsumer(rabbitChannel,queue, onRecivedMessage);
})