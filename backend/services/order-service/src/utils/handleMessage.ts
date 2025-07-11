import {createOrder} from "./createOrder";
import {rabbitmqPublish} from "myrabbitconfig/dist";
import {rabbitChannel} from "../server";
import {updateOrder} from "./updateOrder";

export async function onRecivedMessage(msg: any, callback: any) {
    try {
        const messageContent = JSON.parse(msg.content.toString());
        const {userId, type, order, items} = messageContent.data;
        switch (type) {
            case "NEW":
                const createdOrder = await createOrder(userId, items);
                if (!createdOrder) {
                    console.error("Failed to create order");
                    await rabbitmqPublish(rabbitChannel,"hypersend", "order.client.error", {
                        userId: userId,
                        type: "ORDER_ERROR",
                        order: null,
                        items: items
                    })
                    break
                } else {
                    await rabbitmqPublish(rabbitChannel,"hypersend", "order.client.created", {
                        userId: userId,
                        type: "ORDER_CREATED",
                        order: createdOrder,
                        items: items
                    })
                    break;
                }
            case "PAIMENT_VALIDATED":
                // handle payment validated
                // send to driver and restaurant
                // update order in database
                await rabbitmqPublish(rabbitChannel,"hypersend", "order.*.status", {
                    userId: userId,
                    type: "PAIMENT_VALIDATED",
                    order: order,
                    items: items
                });
                break;
            case "PAIMENT_CANCELED":
                // handle payment canceled
                // updtate order in database
                // send to client
                await rabbitmqPublish(rabbitChannel,"hypersend", "order.client.error", {
                    userId: userId,
                    type: "PAIMENT_CANCELED",
                    order: order,
                    items: items
                });
                break;
            case "VALIDATION_RESTAURANT":
                // handle restaurant validation
                const updatedOrder = await updateOrder(order);
                await rabbitmqPublish(rabbitChannel,"hypersend", "order.*.status", {
                    userId: userId,
                    type: "VALIDATION_RESTAURANT",
                    order: updatedOrder,
                    items: items
                });
                break;
            case "VALIDATION_DRIVER":
                // handle driver validation
                // update order in database
                // send to client and restaurant
                const updatedOrderDriver = await updateOrder(order);
                await rabbitmqPublish(rabbitChannel,"hypersend", "order.*.status", {
                    userId: userId,
                    type: "VALIDATION_DRIVER",
                    order: updatedOrderDriver,
                    items: items
                });
                break;
            case "CANCELED_DRIVER":
                // check if driver has picked up the order
                if (!order.picked_up_at) {
                    const newOrder = {
                        ...order,
                        driver_id: null,
                        picked_up_at: null
                    };
                    const updatedOrderDriverCancel = await updateOrder(newOrder);
                    // search a new driver
                    await rabbitmqPublish(rabbitChannel,"hypersend", "order.*.status", {
                        userId: userId,
                        type: "CANCELED_DRIVER",
                        order: updatedOrderDriverCancel,
                        items: items
                    });
                }
                // reject the cancelation if the order has been picked up
                await rabbitmqPublish(rabbitChannel,"hypersend", "order.driver.status", {
                    userId: userId,
                    type: "REJECTED_CANCEL",
                    order: order,
                    items: items
                });
                break;
            case "CANCELED_RESTAURANT":
                // handle restaurant canceled, stop everything
                // check if the order has been picked up
                if (!order.picked_up_at) {
                    const newOrder = {
                        ...order,
                        canceled_by: "restaurant"
                    };
                    const updatedOrderRestaurantCancel = await updateOrder(newOrder);
                    await rabbitmqPublish(rabbitChannel,"hypersend", "order.*.status", {
                        userId: userId,
                        type: "CANCELED_RESTAURANT",
                        order: updatedOrderRestaurantCancel,
                        items: items
                    });
                }
                // reject the cancelation if the order has been picked up
                await rabbitmqPublish(rabbitChannel,"hypersend", "order.restaurant.status", {
                    userId: userId,
                    type: "REJECTED_CANCEL",
                    order: order,
                    items: items
                });
                break;
            case "CANCELED_CLIENT":
                // handle client canceled, check restaurant validation
                if (!order.accepted_at) {
                    const newOrder = {
                        ...order,
                        canceled_by: "client"
                    };
                    const updatedOrderClientCancel = await updateOrder(newOrder);
                    await rabbitmqPublish(rabbitChannel,"hypersend", "order.*.status", {
                        userId: userId,
                        type: "CANCELED_CLIENT",
                        order: updatedOrderClientCancel,
                        items: items
                    });
                    break;
                } else {
                    await rabbitmqPublish(rabbitChannel,"hypersend", "order.client.status", {
                        userId: userId,
                        type: "REJECTED_CANCEL",
                        order: order,
                        items: items
                    });
                    break
                }
            case "UPDATE":
                // handle delivery update
                // update order in database if needed
                // send to client, restaurant
                const updatedOrderInfo = await updateOrder(order);
                await rabbitmqPublish(rabbitChannel,"hypersend", "order.*.status", {
                    userId: userId,
                    type: "UPDATE",
                    order: updatedOrderInfo,
                    items: items
                });
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