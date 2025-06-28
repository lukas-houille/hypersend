import {Request, Response} from "express";

export function checkNewOrderRequest(req: Request) {
    // TODO add more validation checks for order request
    if (!req.body || !req.body.order || !req.body.items) {
        console.log("Invalid request body");
        return false;
    } else {
        return true;
    }
}