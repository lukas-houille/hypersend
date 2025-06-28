import {retrieveOrderDataByDates, retrieveOrderDataByID} from "../middleware/getOrder";
import {Request, Response, NextFunction} from "express";
import {checkNewOrderRequest} from "../middleware/checkNewOrderRequest";
import {sendOrderToMessageBroker} from "../middleware/sendOrder";

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
            console.log('pass');
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

export const checkOrderData = async (req: Request, res: Response, next: NextFunction) => {
    // This function is a placeholder for verifying order data.
    if (checkNewOrderRequest(req, res)) {
        next();
    } else {
        res.status(400).json({error: "Invalid order request"});
        return;
    }
}

export const sendOrderRequest = async (req: Request, res: Response) => {
    await sendOrderToMessageBroker(req);
    res.status(200).json({message: "Order request sent successfully"});
    return;
}