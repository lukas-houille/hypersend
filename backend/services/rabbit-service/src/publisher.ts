import {Channel} from 'amqplib';

export async function sendDataToMessageBroker(routingKey: string, data:any, channel:Promise<Channel>, exchangeName:string): Promise<void> {
    try {
        const message = JSON.stringify(data);
        await (await channel).assertExchange(exchangeName, 'topic', { durable: true });
        (await channel).publish(exchangeName, routingKey, Buffer.from(message), { persistent: true });

    } catch (error) {
        throw error;
    }
}