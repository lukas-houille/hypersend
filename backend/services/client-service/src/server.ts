import express from "express";
import {clientRoute} from "./routes/client.route";
import {initConnection, startConsumer} from "myrabbitconfig";
import {Channel} from "amqplib";

const cors = require('cors');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(express.json());

app.use("/api/client-service/", clientRoute);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Client Service is running on port ${PORT}`);
});

export let currentOrders: { [key: string]: express.Response } = {};

function fnConsumer(msg: any, callback: any) {
    const messageContent = JSON.parse(msg.content.toString());
    const {userId, type, order, items} = messageContent;
    if (currentOrders[userId]) {
        currentOrders[userId].write(`data: ${JSON.stringify({
            type: type,
            order: order,
            items: items
        })}\n\n`);
    } else {
        console.error("No response found for userId:", userId);
    }
    callback(true);
}

export let rabbitChannel: Channel | null = null;

initConnection((process.env.RABBITMQURL || "amqp://localhost"), "hypersend", "clientService", "#.client.#", (channel: Channel, queue: string) => {
    rabbitChannel = channel;
    startConsumer(rabbitChannel, queue, fnConsumer);
})