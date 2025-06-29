import {Channel} from 'amqplib';

export async function sendDataToMessageBroker(routingKey: string, data:any, channel:Promise<Channel>, exchangeName:string): Promise<void> {
    try {
        const message = JSON.stringify(data);
        const ch = await channel;
        await ch.assertExchange(exchangeName, 'topic', { durable: true });
        ch.publish(exchangeName, routingKey, Buffer.from(message), { persistent: true });

    } catch (error) {
        throw error;
    }
}