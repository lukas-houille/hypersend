import {bigint, pgTable, varchar} from "drizzle-orm/pg-core";

export const address = pgTable("address", {
    address_id: bigint("address_id", { mode:"number" }).primaryKey(),
    street: varchar("street", { length: 100 }).notNull(),
    city: varchar("city", { length: 50 }).notNull(),
    state: varchar("state", { length: 50 }),
    postal_code: varchar("postal_code", { length: 20 }),
    country: varchar("country", { length: 50 }).notNull(),
});