// function send dataToQueue(queueName: string, data: any): Promise<void> {
import amqp from 'amqplib';

export async function sendDataToMessageBroker(routingKey: string, data:any ): Promise<void> {
    try {
        const exchangeName = 'hypersend';

        const connection = await amqp.connect('amqp://localhost:5672'); // Adjust the URL as needed
        const channel = await connection.createChannel();
        const message = JSON.stringify(data);

        await channel.assertExchange(exchangeName, 'topic', { durable: true });
        channel.publish(exchangeName, routingKey, Buffer.from(message), { persistent: true });

        await channel.close();
        await connection.close();
    } catch (error) {
        throw error;
    }
}