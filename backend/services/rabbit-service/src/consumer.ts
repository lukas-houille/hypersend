// get data from message brocker

import {Channel, ConsumeMessage} from 'amqplib';

export async function consumeMessageFromQueue(channel: Channel, queueName: string, callback: (msg: ConsumeMessage | null) => void): Promise<void> {
    try {
        await channel.assertQueue(queueName, { durable: true });
        await channel.consume(queueName, (msg) => {
            if (msg !== null) {
                callback(msg);
                channel.ack(msg); // Acknowledge the message after processing
            }
        });
    } catch (error) {
        throw error;
    }
}