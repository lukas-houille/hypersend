import {db} from "../db";
import {orders} from "../db/orders"
import {eq} from "drizzle-orm";

export async function updateOrder(order: any) {
    try {
        // Update order in the database with drizzle
        const updatedOrder = await db.update(orders)
            .set({
                driver_id: order.driver_id,
                pickup_address_id: order.pickup_address_id,
                delivery_address_id: order.delivery_address_id,
                accepted_at: order.accepted_at,
                picked_up_at: order.picked_up_at,
                delivered_at: order.delivered_at,
                client_rating_driver: order.client_rating_driver,
                client_rating_restaurant: order.client_rating_restaurant,
                special_request: order.special_request,
                total_price: order.total_price.toString(),
                canceled_by: order.canceled_by
            })
            .where(eq(orders.order_id, order.order_id))
            .returning();
        return updatedOrder[0];
    } catch (error) {
        console.error("Error updating order:", error);
        return null;
    }
}