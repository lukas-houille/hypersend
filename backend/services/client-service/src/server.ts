import express from "express";
import { clientRoute } from "./routes/client.route";
import { connectRabbitMQ, connectChannel } from "rabbitmq";

const app = express();

app.use(express.json());

app.use("/api/client-service/", clientRoute);


const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
export const exchangeName = "hypersend";

async function initializeRabbitMQ() {
    try {
        const connection = await connectRabbitMQ(RABBITMQ_URL);
        return await connectChannel(connection);
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        throw error;
    }
}

export const rabbitChannel = initializeRabbitMQ();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Client Service is running on port ${PORT}`);
});