import {Request, Response} from "express";
import {currentOrders} from "../server";

export const createSenderSendEvents = (req:Request, res:Response) => {
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);
    res.write(`Paiment pending\n\n`);
    currentOrders[req.body.userId] = res;
}