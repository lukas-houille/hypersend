import express from "express";
import {clientRoute} from "./routes/client.route";
import {initConnection, startConsumer} from "myrabbitconfig";
import {Channel} from "amqplib";

import cors from 'cors';

const app = express();

app.use(cors({
    origin: [process.env.CORS_ORIGIN || "http://localhost:3000", "http://localhost"],
    credentials: true, // Allow credentials to be sent
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
}));

app.use(express.json());

app.use("/api/client-service/", clientRoute);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Client Service is running on port ${PORT}`);
});

export let currentOrders: { [key: string]: express.Response } = {};

function sendToClient(msg: any, callback: any) {
    const messageContent = JSON.parse(msg.content.toString());
    const {userId, type, order, items, positionPercentage} = messageContent;
    if (currentOrders[userId]) {
        currentOrders[userId].write(`data: ${JSON.stringify({
            type: type,
            order: order,
            items: items,
            positionPercentage: positionPercentage
        })}\n\n`);
        if (type === "UPDATE" && order.delivered_at || type === "PAIMENT_DECLINED") {
            currentOrders[userId].end();
            console.log("Closing connection", userId);
            delete currentOrders[userId];
        }
    } else {
        console.error("No response found for userId:", userId);
    }
    callback(true);
}

export let rabbitChannel: Channel | null = null;

initConnection((process.env.RABBITMQURL || "amqp://localhost"), "hypersend", "clientService", "#.client.#", (channel: Channel, queue: string) => {
    rabbitChannel = channel;
    startConsumer(rabbitChannel, queue, sendToClient);
})