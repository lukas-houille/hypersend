import {rabbitChannel} from "../server";
import {rabbitmqPublish} from "myrabbitconfig/dist";

export async function onRecivedMessage(msg: any, callback: any) {
    try {
        const messageContent = JSON.parse(msg.content.toString());
        const {userId, type, order, items} = messageContent;
        switch (type) {
            case "NEW":
                await new Promise(resolve => setTimeout(resolve, 2000));
                const isPaymentValidated = Math.random() < 0.9;
                if (isPaymentValidated) {
                    console.log("Payment validated for user:", userId, "amount:", order.total_price);
                    await rabbitmqPublish(rabbitChannel,"hypersend", "client.order",{
                        userId: userId,
                        type: "PAIMENT_VALIDATED",
                        order: order,
                        items: items
                    });
                } else {
                    console.log("Payment declined for user:", userId, "amount:", order.total_price);
                    await rabbitmqPublish(rabbitChannel,"hypersend", "order", {
                        userId: userId,
                        type: "PAIMENT_DECLINED",
                        order: order,
                        items: items
                    });
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