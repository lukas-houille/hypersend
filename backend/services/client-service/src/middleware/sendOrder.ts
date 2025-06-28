// send order to rabbitmq client.order.neworder
import { Request } from "express";
import { sendDataToMessageBroker } from "../utils/rabbitmq";

export const sendOrderToMessageBroker = async (req: Request) => {
    try {
        // Extract order data from the request body

        const orderData = {
            "order": req.body.order,
            "items": req.body.items,
        }

        // Send the order data to the RabbitMQ queue
        await sendDataToMessageBroker("client.order.neworder", orderData );
        return;
    } catch (error) {
        console.error("Error sending order request:", error);
        return;
    }
};