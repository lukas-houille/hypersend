import express from "express";
import {checkOrderData, getOrderData, getOrderTracking, sendOrderRequest} from "../controller/order.controller";
export const clientRoute = express.Router();

const defaultResponse = (res:any) => {
    res.status(200).send("Welcome to the Client Service API");
}

clientRoute.get("/orders", getOrderData );

clientRoute.post("/neworder", checkOrderData, sendOrderRequest);

clientRoute.post("/rating", defaultResponse);

clientRoute.get("/order-tracking/", getOrderTracking);

clientRoute.get("/profile", defaultResponse);

clientRoute.post("/profile", defaultResponse);

clientRoute.get("/healthcheck", defaultResponse);