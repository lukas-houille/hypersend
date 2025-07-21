
import {bigint, pgTable, varchar, timestamp, boolean} from "drizzle-orm/pg-core";

export const items = pgTable("items", {
    id: bigint("item_id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    restaurant_id: bigint("restaurant_id", { mode: "number" }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    price: bigint("price", { mode: "number" }).notNull(),
    description: varchar("description", { length: 1024 }),
    created_at: timestamp("created_at").defaultNow(),
    available: boolean("available"),
    img_url: varchar("img_url", { length: 512 })
});