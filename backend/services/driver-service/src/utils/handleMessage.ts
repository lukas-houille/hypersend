import {rabbitChannel} from "../server";
import {rabbitmqPublish} from "myrabbitconfig/dist";

export async function onRecivedMessage(msg: any, callback: any) {
    try {
        const messageContent = JSON.parse(msg.content.toString());
        const {userId, type, order, items} = messageContent;
        switch (type) {
            case "NEW":
                console.log("Processing new order for user:", userId, "type:", type);
                // send to driver for validation
                // DRIVER_VALIDATION
                const updatedOrder = {
                    ...order,
                    driver_id: 1 // initially no driver assigned
                }
                await rabbitmqPublish(rabbitChannel, "hypersend", "order", {
                    userId: userId,
                    type: "VALIDATION_DRIVER",
                    order: updatedOrder,
                    items: items
                });
                // update order with new driver ID
                break;
            case "VALIDATION_RESTAURANT":
                console.log("Processing new order for user:", userId, "type:", type);
                // if driver id found, send to driver
                // if not IDK
                break;
            case "UPDATE":
                console.log("Updating order for user:", userId);
                // if driver id found, send to driver
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