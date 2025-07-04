import { Channel } from "amqplib";
import { initConnection, startConsumer } from "myrabbitconfig";
import {onReciveMessage} from "./utils/handleMessage";

export let rabbitChannel: Channel | null = null;

initConnection((process.env.RABBITMQURL || "amqp://localhost"),"hypersend" , "orderService", "*.order.*", (channel:Channel, queue: string) => {
    rabbitChannel = channel;
    startConsumer(rabbitChannel,queue, onReciveMessage);
})