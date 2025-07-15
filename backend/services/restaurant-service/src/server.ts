import { Channel } from "amqplib";
import { initConnection, startConsumer } from "myrabbitconfig";
import {onRecivedMessage} from "./utils/handleMessage";

export let rabbitChannel: Channel | null = null;

initConnection((process.env.RABBITMQURL || "amqp://localhost"),"hypersend" , "restaurantService", "#.restaurant.#", (channel:Channel, queue: string) => {
    rabbitChannel = channel;
    startConsumer(rabbitChannel,queue, onRecivedMessage);
})