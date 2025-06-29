// get data from message brocker

import {Channel, ConsumeMessage} from 'amqplib';

export async function consumeMessageFromQueue(
    channel: Channel,
    queueName: string,
    callback: (msg: ConsumeMessage) => void
): Promise<void> {
    await channel.assertQueue(queueName, { durable: true });
    await channel.consume(queueName, (msg) => {
        if (msg !== null) {
            try {
                callback(msg);
                channel.ack(msg); // Acknowledge after successful processing
            } catch (error) {
                console.error('Error processing message:', error);
                channel.nack(msg, false, false); // Reject message without requeue
            }
        }
    });
}