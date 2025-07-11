import {retrieveOrderDataByDates, retrieveOrderDataByID} from "../middleware/getOrder";
import {Request, Response} from "express";
import {currentOrders, rabbitChannel} from "../server";
import {rabbitmqPublish} from 'myrabbitconfig';
import {createSenderSendEvents} from "../middleware/createSenderSendEvents";

export const getOrderData = async (req: Request, res: Response) => {
    try {
        const orderId: number = req.body.orderId;
        const clientId: number = req.body.userId;
        const startDate: Date | undefined = req.body.startDate ? new Date(req.body.startDate) : undefined;
        const endDate: Date | undefined = req.body.endDate ? new Date(req.body.endDate) : undefined;
        if (!clientId) {
            res.status(400).send({message: "clientId is required"});
            return;
        }
        if (!orderId && (!startDate || !endDate)) {
            res.status(400).json({message: "Bad request, please provide either order ID or date range"});
            return;
        }
        if (startDate && endDate && startDate <= endDate) {
            res.status(400).json({message: "Bad request, start date must be before end date"});
            return;
        }
        try {
            let orderData = [];
            if (orderId) {
                orderData = await retrieveOrderDataByID(orderId, clientId);
            } else if (startDate && endDate){

                orderData = await retrieveOrderDataByDates(startDate, endDate, clientId);
            } else {
                res.status(400).json({message: "Bad request, please provide either order ID or date range"});
                return;
            }
            if (orderData.length > 0) {
                res.status(200).json(orderData);
                return;
            } else {
                res.status(404).json({message: "No order found"});
                return;
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({error: "error while retrieving order data"});
            return;
        }
    } catch (error: any) {
        console.error("Error in getOrderData:", error);
        res.status(400).json("Error while processing request");
        return;
    }
}

export const sendOrderRequest = async (req: Request, res: Response) => {
    try {
        if( rabbitChannel && !currentOrders[req.body.userId] ) {
            const data = {
                userId: req.body.userId,
                type: "NEW",
                items: req.body.items,
            }
            await rabbitmqPublish(rabbitChannel, "hypersend", "client.order.neworder", {data});
            createSenderSendEvents(req, res)
            return;
        } else {
            // throw error if order already exists
            res.status(400).json({message: "Order already exists or RabbitMQ channel is not initialized"});
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error while sending order request"});
        return;
    }
}

export const getOrderTracking = async (req: Request, res: Response) => {
    try {
        const userId: number = req.body.userId;
        if (!userId) {
            res.status(400).json({message: "Order ID is required"});
            return;
        }
        if (!currentOrders[userId]) {
            // if the order is not in currentOrders, get order state
            res.status(404).json({message: "No tracking information found for this order"});
            return;
        } else {
            const headers = {
                'Content-Type': 'text/event-stream',
                'Connection': 'keep-alive',
                'Cache-Control': 'no-cache'
            };
            res.writeHead(200, headers);
            res.write(`Order tracking for user ${userId}\n\n`);
            currentOrders[userId] = res;
        }
    } catch (error) {
        console.error("Error in getOrderTracking:", error);
        res.status(500).json({error: "Error while retrieving order tracking information"});
    }
}