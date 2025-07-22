import {eq, and, gte, lt} from "drizzle-orm";
import {db} from "../db";
import {orders} from "../db/orders";

export async function retrieveOrderDataByID(orderId: number, clientId: number) {
    try {
        return await db.select().from(orders).where(
            and(
                eq(orders.order_id, orderId),
                eq(orders.client_id, clientId)
            ));
    } catch (error) {
        throw error;
    }
}

export async function retrieveOrderDataByDates(
    startDate: Date,
    endDate: Date,
    clientId: number
) {
    try {
        return await db.select().from(orders).where(
            and(
                eq(orders.client_id, clientId),
                gte(orders.created_at, startDate),
                lt(orders.created_at, endDate)
            )
        );
    } catch (error) {
        throw error;
    }
}