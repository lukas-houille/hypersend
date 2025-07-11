import {Request, Response} from "express";
import {currentOrders} from "../server";

export const createSenderSendEvents = (req:Request, res:Response) => {
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);
    res.write(`data: ${JSON.stringify({message: "Order created successfully, waiting for updates..."})}\n\n`);
    currentOrders[req.body.userId] = res;
}