import express from "express";
import {getOrderData, getOrderTracking, sendOrderRequest} from "../controller/order.controller";
export const clientRoute = express.Router();

const defaultResponse = (res:any) => {
    res.status(200).send("Welcome to the Client Service API");
}

clientRoute.get("/orders", getOrderData );

clientRoute.post("/neworder", sendOrderRequest);

clientRoute.post("/orderTracking", getOrderTracking);

clientRoute.post("/rating", defaultResponse);

clientRoute.get("/profile", defaultResponse);

clientRoute.post("/profile", defaultResponse);

clientRoute.get("/healthcheck", defaultResponse);