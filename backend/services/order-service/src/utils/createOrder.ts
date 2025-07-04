// create order to the postgres db using drizzle

import { orders } from "../db/orders";
import { db } from "../db";
import { order_items } from "../db/order_items";

export async function createOrder(order: any, items: any[]) {
    const newOrder = await db.insert(orders).values({
        client_id: order.client_id,
        driver_id: order.driver_id,
        restaurant_id: order.restaurant_id,
        pickup_address_id: order.pickup_address_id,
        delivery_address_id: order.delivery_address_id,
        accepted_at: order.accepted_at,
        picked_up_at: order.picked_up_at,
        delivered_at: order.delivered_at,
        client_rating_driver: null,
        client_rating_restaurant: null,
        special_request: order.special_request,
        canceled_by: null
    }).returning();

    // Insert items into the order_items table
    const orderItems = items.map(item => ({
        order_id: newOrder[0].id,
        restaurant_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
    }));

    await db.insert(order_items).values(orderItems);

    return newOrder[0];
}