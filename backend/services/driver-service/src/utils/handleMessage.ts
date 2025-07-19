import {rabbitChannel} from "../server";
import {rabbitmqPublish} from "myrabbitconfig/dist";

export async function onRecivedMessage(msg: any, callback: any) {
    try {
        const messageContent = JSON.parse(msg.content.toString());
        const {userId, type, order, items} = messageContent;
        switch (type) {
            case "NEW":
                console.log("Processing new order for user:", userId, "type:", type);
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
                // if not do nothing
                break;
            case "CANCELED_ORDER":
                break;
            case "UPDATE":
                console.log("Updating order for user:", userId);
                // if driver id found, send to driver
                // simulate driver response
                // if order ready_at and !delivered_at and !picked_up_at wait 5 seconds and send update with picked_up_at
                if(order.ready_at && !order.picked_up_at && !order.delivered_at) {
                    setTimeout(async () => {
                        const updatedOrder = {
                            ...order,
                            picked_up_at: new Date(),
                        };
                        await rabbitmqPublish(rabbitChannel, "hypersend", "order", {
                            userId: userId,
                            type: "UPDATE",
                            order: updatedOrder,
                            items: items
                        });
                    }, 5000);
                } else if(order.picked_up_at && !order.delivered_at) {
                    // send position porcentage update every 2 seconds
                    // then delivery after 10 seconds
                    let positionPercentage = 0;
                    const interval = setInterval(async () => {
                        positionPercentage += 10;
                        if (positionPercentage >= 100) {
                            clearInterval(interval);
                            const updatedOrder = {
                                ...order,
                                delivered_at: new Date(),
                            };
                            await rabbitmqPublish(rabbitChannel, "hypersend", "order", {
                                userId: userId,
                                type: "UPDATE",
                                order: updatedOrder,
                                items: items
                            });
                        } else {
                            await rabbitmqPublish(rabbitChannel, "hypersend", "order", {
                                userId: userId,
                                type: "DRIVER_STATUS",
                                positionPercentage: positionPercentage
                            });
                        }
                    }, 2000);
                }
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