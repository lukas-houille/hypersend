import { Channel } from "amqplib";
import { initConnection, startConsumer } from "myrabbitconfig";
import {onRecivedMessage} from "./utils/handleMessage";
import express from "express";
import {restaurantRoute} from "./routes/restaurant";
import cors from 'cors';

const app = express();

app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(express.json());

app.use("/api/restaurants/", restaurantRoute);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Client Service is running on port ${PORT}`);
});

export let rabbitChannel: Channel | null = null;

initConnection((process.env.RABBITMQURL || "amqp://localhost"),"hypersend" , "restaurantService", "#.restaurant.#", (channel:Channel, queue: string) => {
    rabbitChannel = channel;
    startConsumer(rabbitChannel,queue, onRecivedMessage);
})