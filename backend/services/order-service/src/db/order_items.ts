// order_item_id
// order_id
// restaurant_item_id
// quantity
// special_request


import {bigint, pgTable, varchar} from "drizzle-orm/pg-core";
import {orders} from "./orders";

export const order_items = pgTable("order_items", {
    id: bigint("order_item_id", {mode: "number"}).primaryKey().generatedByDefaultAsIdentity(),
    order_id: bigint("order_id", {mode: "number"}).notNull().references(() => orders.order_id),
    restaurant_item_id: bigint("restaurant_item_id", {mode: "number"}).notNull(),
    quantity: bigint("quantity", {mode: "number"}).notNull(),
    special_request: varchar("special_request", {length: 255}),
});