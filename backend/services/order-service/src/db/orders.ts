import {bigint, pgTable, varchar, timestamp} from "drizzle-orm/pg-core";
import {restaurant} from "./restaurant";
import {client} from "./client";
import {driver} from "./driver";
import {address} from "./address";

export const orders = pgTable("orders", {
    id: bigint("order_id", {mode:"number"}).primaryKey().generatedByDefaultAsIdentity(),
    client_id: bigint("client_id", { mode: "number" }).notNull().references(() => client.id),
    driver_id: bigint("driver_id", { mode: "number" }).references(() => driver.id),
    restaurant_id: bigint("restaurant_id", { mode: "number" }).references(() => restaurant.id),
    pickup_address_id: bigint("pickup_address_id",{mode:"number"}).references(() => address.address_id),
    delivery_address_id: bigint("delivery_address_id",{mode:"number"}).references(() => address.address_id),
    accepted_at: timestamp("accepted_at"),
    picked_up_at: timestamp("picked_up_at"),
    delivered_at: timestamp("delivered_at"),
    created_at: timestamp("created_at").defaultNow(),
    client_rating_driver: varchar("client_rating_driver", { length: 5 }),
    client_rating_restaurant: varchar("client_rating_restaurant", { length: 5 }),
    special_request: varchar("special_request", { length: 255 }),
    canceled_by: varchar("canceled_by", { length: 20 }) // "client", "restaurant", "driver", "none",
});

// order interface

// export interface from drizzle-orm

export interface Order {
    order_id: number;
    client_id: number;
    driver_id?: number;
    pickup_address_id: number;
    delivery_address_id: number;
    status: string;
    accepted_at?: Date | null;
    picked_up_at?: Date | null;
    delivered_at?: Date | null;
    created_at: Date | null;
    client_rating_driver?: string | null;
    client_rating_restaurant?: string | null;
    special_request?: string | null;
    restaurant_id: number;
}