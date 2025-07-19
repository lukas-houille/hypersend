import {createOrder} from "./createOrder";
import {rabbitmqPublish} from "myrabbitconfig/dist";
import {rabbitChannel} from "../server";
import {db} from "../db";
import {orders} from "../db/orders";
import {eq} from "drizzle-orm";

export async function onRecivedMessage(msg: any, callback: any) {
    try {
        const messageContent = JSON.parse(msg.content.toString());
        const {userId, type, order, items} = messageContent;
        switch (type) {
            case "NEW":
                console.log("Processing order for user:", userId, "type:", type);
                const createdOrder = await createOrder(userId, items);
                if (!createdOrder) {
                    console.error("Failed to create order");
                    await rabbitmqPublish(rabbitChannel,"hypersend", "client",{
                        userId: userId,
                        type: "ORDER_ERROR",
                        order: null,
                        items: items
                    })
                    break
                } else {
                    await rabbitmqPublish(rabbitChannel,"hypersend", "paiment", {
                        userId: userId,
                        type: "NEW",
                        order: createdOrder,
                        items: items
                    })
                    break;
                }
            case "PAIMENT_VALIDATED":
                // handle payment validated
                // send to driver and restaurant
                // update order in database
                console.log("Processing order for user:", userId, "type:", type);
                await rabbitmqPublish(rabbitChannel,"hypersend", "restaurant.driver", {
                    userId: userId,
                    type: "NEW",
                    order: order,
                    items: items
                });
                break;
            case "PAIMENT_DECLINED":
                // handle payment canceled
                // updtate order in database
                // send to client
                console.log("Processing order for user:", userId, "type:", type);
                await rabbitmqPublish(rabbitChannel,"hypersend", "client", {
                    userId: userId,
                    type: "PAIMENT_DECLINED",
                    order: order,
                    items: items
                });
                break;
            case "VALIDATION_RESTAURANT":
                console.log("Processing order for user:", userId, "type:", type);
                // handle restaurant validation
                const orderWithRestaurant = await db.update(orders)
                    .set({
                        accepted_at: new Date(order.accepted_at),
                    })
                    .where(eq(orders.order_id, order.order_id))
                    .returning();
                await rabbitmqPublish(rabbitChannel,"hypersend", "client.driver", {
                    userId: userId,
                    type: "VALIDATION_RESTAURANT",
                    order: orderWithRestaurant[0],
                    items: items
                });
                break;
            case "VALIDATION_DRIVER":
                console.log("Processing order for user:", userId, "type:", type);
                // handle driver validation
                // update order in database
                // send to client and restaurant
                const orderWithDriver = await db.update(orders)
                    .set({
                        driver_id: order.driver_id,
                    })
                    .where(eq(orders.order_id, order.order_id))
                    .returning()
                await rabbitmqPublish(rabbitChannel,"hypersend", "client.restaurant", {
                    userId: userId,
                    type: "VALIDATION_DRIVER",
                    order: orderWithDriver[0],
                    items: items
                });
                break;
            case "CANCELED_DRIVER":
                // check if driver has picked up the order
                if (!order.picked_up_at) {
                    // search a new driver
                    await rabbitmqPublish(rabbitChannel,"hypersend", "driver", {
                        userId: userId,
                        type: "NEW",
                        order: await db.update(orders)
                            .set({
                                driver_id: null,
                            })
                            .where(eq(orders.order_id, order.order_id))
                            .returning(),
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
                    await rabbitmqPublish(rabbitChannel,"hypersend", "client.driver", {
                        userId: userId,
                        type: "CANCELED_ORDER",
                        order: await db.update(orders)
                            .set({
                                canceled_by: "restaurant",
                            })
                            .where(eq(orders.order_id, order.order_id))
                            .returning(),
                        items: items
                    });
                }
                // reject the cancelation if the order has been picked up
                await rabbitmqPublish(rabbitChannel,"hypersend", "restaurant", {
                    userId: userId,
                    type: "REJECTED_CANCEL",
                    order: order,
                    items: items
                });
                break;
            case "CANCELED_CLIENT":
                // handle client canceled, check restaurant validation
                if (!order.accepted_at) {
                    await rabbitmqPublish(rabbitChannel,"hypersend", "client.restaurant.driver", {
                        userId: userId,
                        type: "CANCELED_ORDER",
                        order: await db.update(orders)
                            .set({
                                canceled_by: "client",
                            })
                            .where(eq(orders.order_id, order.order_id))
                            .returning(),
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
                const updatedOrderInfo = await db.update(orders)
                    .set({
                        ready_at: order.ready_at ? new Date(order.ready_at) : null,
                        picked_up_at: order.picked_up_at ? new Date(order.picked_up_at) : null,
                        delivered_at: order.delivered_at ? new Date(order.delivered_at) : null,
                    })
                    .where(eq(orders.order_id, order.order_id))
                    .returning();
                await rabbitmqPublish(rabbitChannel,"hypersend", "client.restaurant.driver", {
                    userId: userId,
                    type: "UPDATE",
                    order: updatedOrderInfo[0],
                    items: items
                });
                break;
            case "DRIVER_STATUS":
                await rabbitmqPublish(rabbitChannel,"hypersend", "client.restaurant", {
                    userId: userId,
                    type: "DRIVER_STATUS",
                    positionPercentage: messageContent.positionPercentage
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