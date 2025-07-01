// Add proper types for ch and err
import {Channel, ConsumeMessage} from "amqplib";

export async function startConsumer(channel:Channel, queue: string, fnConsumer: (msg: ConsumeMessage, callback: (ok: boolean) => void) => void) {
    await channel.consume(queue, (msg: ConsumeMessage | null) => {
        if (msg) {
            fnConsumer(msg, (ok: boolean) => {
                ok ? channel.ack(msg) : channel.nack(msg, false, true); // Acknowledge the message if processed successfully, otherwise requeue it
            });
        }
    }, {noAck: false});
    console.log('[AMQP] Waiting for messages in %s.', queue);
}