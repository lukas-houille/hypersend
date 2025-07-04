import {orders} from "../db/orders";
import {checkOrderContent} from "./checkOrderContent";
import {getPaiment} from "./getPaiment";
import {createOrder} from "./createOrder";

export async function onReciveMessage(msg: any, callback: any){
    // This function will handle the incoming messages from RabbitMQ.
    // You can implement your logic here to process the messages.
    console.log("Message received and processed");
    try {
        const messageContent = JSON.parse(msg.content.toString());
        const { from, type, order, items } = messageContent;

        console.log("Received order", from, type, order, items);

        if (!order || !items) {
            console.error("Invalid message format:", msg.content.toString());
            callback(false);
            return;
        }
        switch (type) {
            case "NEW":
                if ( await checkOrderContent(order, items)) {
                    const createdORder = createOrder(order, items);
                    getPaiment();
                    console.log("Received order", createdORder);
                } else {
                    console.error("Order content check failed");
                }
                break;
            case "PAIMENT_VALIDATED":
                // handle payment validated
                break;
            case "PAIMENT_CANCELED":
                // handle payment canceled
                break;
            case "VALIDATION_RESTAURANT":
                // handle restaurant validation
                break;
            case "VALIDATION_DRIVER":
                // handle driver validation
                break;
            case "CANCELED_DRIVER":
                // handle driver canceled, find new driver
                break;
            case "CANCELED_RESTAURANT":
                // handle restaurant canceled, stop everything
                break;
            case "CANCELED_CLIENT":
                // handle client canceled, check restaurant validation
                break;
            case "UPDATE":
                // handle delivery update
                break;
            default:
                console.error("Unknown message type:", type);
        }
        callback(true);
    } catch (error) {
        console.error("Error processing message:", error);
        callback(true);
    }
}