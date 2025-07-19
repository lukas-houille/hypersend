import {rabbitChannel} from "../server";
import {rabbitmqPublish} from "myrabbitconfig";

export async function onRecivedMessage(msg: any, callback: any) {
    try {
        const messageContent = JSON.parse(msg.content.toString());
        const {userId, type, order, items} = messageContent;
        switch (type) {
            case "NEW":
                console.log("Processing new order for user:", userId, "type:", type);
                // get connected restaurant and ask for validation
                // if validated, update the order object with accepted at timestamp
                // and send to driver and restaurant
                // current timestamp
                const updatedOrder = {
                    ...order,
                    accepted_at: new Date(),
                }
                await rabbitmqPublish(rabbitChannel, "hypersend", "order", {
                    userId: userId,
                    type: "VALIDATION_RESTAURANT",
                    order: updatedOrder,
                    items: items
                });
                break;
            case "VALIDATION_DRIVER":
                // simulate order ready at restaurant
                setTimeout(async () => {
                    const updatedOrder = {
                        ...order,
                        ready_at: new Date(),
                    };
                    await rabbitmqPublish(rabbitChannel, "hypersend", "order", {
                        userId: userId,
                        type: "UPDATE",
                        order: updatedOrder,
                        items: items
                    });
                }, 5000);
            case "UPDATE":
                console.log("Processing new order for user:", userId, "type:", type);
                break;
            case "DRIVER_STATUS":
                console.log("Processing order for user:", userId, "type:", type);
                break;
            case "CANCELED_ORDER":
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