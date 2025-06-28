import amqp, {Channel} from 'amqplib';

export async function connectRabbitMQ(url: string): Promise<amqp.ChannelModel> {
    return await amqp.connect(url); // Adjust the URL as needed
}

export async function connectChannel(connection: amqp.ChannelModel): Promise<amqp.Channel> {
    return await connection.createChannel();
}

// Function to close the connection
export async function closeRabbitMQ(connection: amqp.ChannelModel, channel:Channel): Promise<void> {
    await channel.close();
    await connection.close();
}
