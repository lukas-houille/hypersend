import {bigint, pgTable, varchar, date, timestamp} from "drizzle-orm/pg-core";

import {address} from "./address";

export const client = pgTable("clients", {
    id: bigint("client_id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    email: varchar("email", { length: 256 }).notNull().unique(),
    password_hash: varchar("password_hash", { length: 256 }).notNull(),
    first_name: varchar("first_name", { length: 50 }),
    last_name: varchar("last_name", { length: 50 }),
    date_of_birth: date("date_of_birth"),
    phone_number: varchar("phone_number", { length: 15 }),
    address_id: bigint("address_id", {mode:"bigint"}).references(() => address.address_id),
    registered_at: timestamp("registered_at").defaultNow(),
});