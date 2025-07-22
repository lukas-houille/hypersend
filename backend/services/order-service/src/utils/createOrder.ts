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
            console.log("Invalid input: userId or Orderitems is missing");
        }
        // Check if items are valid
        const validItems = await db.select().from(items).where(
            inArray(items.id, Orderitems.map(item => item.id))
        );
        let totalPrice = 0;
        const restaurantId = validItems[0]?.restaurant_id || 0;

        const orderItemsData = validItems
            .filter(validItem => validItem.available && validItem.restaurant_id === restaurantId)
            .map(validItem => {
                const orderItem = Orderitems.find(item => item.id === validItem.id);
                if (!orderItem) return null;
                const itemPrice = parseFloat(validItem.price.toString());
                if (isNaN(itemPrice)) return null;
                totalPrice += itemPrice * orderItem.quantity;
                return {
                    order_id: 0,
                    restaurant_item_id: validItem.id,
                    quantity: orderItem.quantity,
                    special_request: orderItem.special_request || null
                };
            })
            .filter(item => item !== null);

        const newOrder = await db.insert(orders).values({
            client_id: userId,
            driver_id: null,
            restaurant_id: restaurantId,
            pickup_address_id: 1,
            delivery_address_id: 2,
            accepted_at: null,
            picked_up_at: null,
            delivered_at: null,
            client_rating_driver: null,
            client_rating_restaurant: null,
            special_request: null,
            total_price: totalPrice.toString(),
            canceled_by: null,
            ready_at: null,
        }).returning();

        // update order items with the new order ID
        const orderId : number = newOrder[0].order_id? newOrder[0].order_id : 0;

        await db.insert(order_items).values(orderItemsData.map(item => ({
            ...item,
            order_id: orderId
        })));

        return newOrder[0];

    } catch (error:any) {
        console.error("Error creating order:", error);
    }
}