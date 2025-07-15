import {rabbitChannel} from "../server";
import {rabbitmqPublish} from "myrabbitconfig/dist";

export async function onRecivedMessage(msg: any, callback: any) {
    try {
        const messageContent = JSON.parse(msg.content.toString());
        const {userId, type, order, items} = messageContent;
        switch (type) {
            case "PAIMENT_VALIDATED":
                console.log("Processing new order for user:", userId);
                // get connected restaurant and ask for validation
                // if validated, update the order object with accepted at timestamp
                // and send to driver and restaurant
                const updatedOrder = {
                    ...order,
                    acceptedAt: new Date().toISOString()
                }
                await rabbitmqPublish(rabbitChannel, "hypersend", "order", {
                    userId: userId,
                    type: "VALIDATION_RESTAURANT",
                    order: updatedOrder,
                    items: items
                });
                break;

            case "UPDATE":
                console.log("Updating order for user:", userId);
                // TODO send to the matching restaurant the updated order with SSE
                break;

            case "DRIVER_STATUS":
                // TODO send to restaurant the driver status with SSE
                break;
            default:
                console.error("Unknown message type:", type);
                break;
        }
        callback(true);
        return;
    } catch (error) {
        console.error("Error processing message:", error);
        callback(true);
    }
}