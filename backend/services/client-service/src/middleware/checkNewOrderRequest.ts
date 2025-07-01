import {Request} from "express";

export function checkNewOrderRequest(req: Request) {
    // TODO add more validation checks for order request
    try{
        console.log("Checking new order request");
        return (req.body || req.body.userId || req.body.orderDetails.order || req.body.orderDetails.items)
    } catch (e) {
        console.log("Invalid request body");
        return false;
    }
}