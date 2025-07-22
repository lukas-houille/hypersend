import {bigint, pgTable, varchar, timestamp} from "drizzle-orm/pg-core";
import {address} from "./address";
import {restaurantType} from "./restaurantType";

export const restaurant = pgTable("restaurants", {
    id: bigint("restaurant_id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 100 }),
    email: varchar("email", { length: 256 }).notNull().unique(),
    password_hash: varchar("password_hash", { length: 256 }).notNull(),
    phone_number: varchar("phone_number", { length: 15 }),
    type: bigint("type", { mode: "number" }).references(() => restaurantType.restaurant_type_id),
    address_id: bigint("address_id", { mode: "number" }).references(() => address.address_id),
    opening_hours: varchar("opening_hours", { length: 255 }),
    opening_days: varchar("opening_days", { length: 255 }),
    rating: varchar("rating", { length: 3 }).default("0.0"),
    created_at: timestamp("created_at").defaultNow(),
    img_url: varchar("img_url", { length: 512 }),
    description: varchar("description", { length: 1024 }),
});