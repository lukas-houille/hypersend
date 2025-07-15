// create order to the postgres db using drizzle

import { orders } from "../db/orders";
import { db } from "../db";
import { order_items } from "../db/order_items";
import {items} from "../db/items";
import { inArray } from 'drizzle-orm';

export async function createOrder(userId: number, Orderitems: any[]) {
    // get restaurant id and price from db
    try{
        if (!userId || !Orderitems || Orderitems.length === 0) {
            throw new Error("Invalid user ID or order items");
        }
        // Check if items are valid
        const validItems = await db.select().from(items).where(
            inArray(items.item_id, Orderitems.map(item => item.item_id))
        );
        let totalPrice = 0;
        const restaurantId = validItems.length > 0 ? validItems[0].restaurant_id : null;
        // for each instance of Orderitems, check if the item is available, calculate the total price and create the order items data
        const orderItemsData = Orderitems.map(item => {
            const validItem = validItems.find(validItem => validItem.item_id === item.item_id);
            if (!validItem || !validItem.available || validItem.restaurant_id !== restaurantId) {
                return;
            }
            const itemPrice = parseFloat(validItem.price.toString());
            if (isNaN(itemPrice)) {
                return;
            }
            totalPrice += itemPrice * item.quantity;
            return {
                order_id: 0, // This will be set later when the order is created
                restaurant_item_id: restaurantId,
                quantity: item.quantity,
                special_request: item.special_request ? item.special_request : null
            };
        }).filter(item => item !== null);

        const newOrder = await db.insert(orders).values({
            client_id: userId,
            driver_id: null,
            restaurant_id: restaurantId,
            pickup_address_id: null,
            delivery_address_id: null,
            accepted_at: null,
            picked_up_at: null,
            delivered_at: null,
            client_rating_driver: null,
            client_rating_restaurant: null,
            special_request: null,
            total_price: totalPrice.toString(),
            canceled_by: null,
            ready_at: null
        }).returning();

        // update order items with the new order ID
        const orderId = newOrder[0].order_id;

        await db.insert(order_items).values(orderItemsData.map(item => ({
            ...item,
            order_id: orderId
        })));

        return newOrder[0];

    } catch (error:any) {
        console.error("Error creating order:", error.message);
    }
}