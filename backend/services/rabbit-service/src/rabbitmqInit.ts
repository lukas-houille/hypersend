import amqp from "amqplib";

export async function initConnection(amqpURL: string, exchange: string, queue: string, pattern: string, fnFinish: any) {
    try {
        let rabbitConnection = await amqp.connect(amqpURL)
        rabbitConnection.on("close", () => {
            console.error("[AMQP] Connection closed, retrying in 5 seconds...");
            setTimeout(() => {
                initConnection(amqpURL, exchange, queue, pattern, fnFinish);
            }, 5000);
        });
        console.log("[AMQP] connected");
        let rabbitChannel = await rabbitConnection.createChannel();
        await rabbitChannel.assertExchange(exchange, 'topic', {durable: true});
        await rabbitChannel.assertQueue(queue, {durable: true});
        await rabbitChannel.bindQueue(queue, exchange, pattern);
        fnFinish(rabbitChannel, queue);
    } catch (err) {
        // if connection refused try again after 5 seconds
        console.error("[AMQP] Connection error, retrying in 5 seconds...");
        setTimeout(() => {
            initConnection(amqpURL, exchange, queue, pattern, fnFinish);
        }, 5000);
    }
}