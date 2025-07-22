import {Channel} from "amqplib";

export async function rabbitmqPublish(channel:Channel, exchange:string, routingKey:string, data:any) {
    try {
        // Publish the message to the specified exchange with the routing key
        channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(data)), {
            persistent: true // Ensure the message is persistent
        });
        console.log(`[AMQP] Message published to exchange "${exchange}" with routing key "${routingKey}"`);
    } catch (err:any) {
        console.error(`[AMQP] Error publishing message: ${err.message}`);
    }
}