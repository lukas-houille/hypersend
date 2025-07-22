import {boolean, bigint, pgTable, varchar, numeric, timestamp} from "drizzle-orm/pg-core";

export const items = pgTable("items", {
    id: bigint("item_id", {mode: "number"}).primaryKey().generatedByDefaultAsIdentity(),
    restaurant_id: bigint("restaurant_id", {mode: "number"}).notNull(),
    name: varchar("name", {length: 255}).notNull(),
    type: varchar("type", {length: 50}).notNull(),
    price: numeric("price", {precision: 10, scale: 2}).notNull(),
    description: varchar("description", {length: 500}),
    created_at: timestamp("created_at").defaultNow().notNull(),
    available: boolean("available").default(true).notNull(),
});