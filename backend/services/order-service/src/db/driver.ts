import {bigint, pgTable, varchar, date, timestamp} from "drizzle-orm/pg-core";
import {address} from "./address";

export const driver = pgTable("drivers", {
    id: bigint("driver_id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    email: varchar("email", { length: 256 }).notNull(),
    password_hash: varchar("password_hash", { length: 256 }).notNull(),
    first_name: varchar("first_name", { length: 100 }),
    last_name: varchar("last_name", { length: 100 }),
    date_of_birth: date("date_of_birth"),
    phone_number: varchar("phone_number", { length: 15 }),
    driver_license: varchar("driver_license", { length: 100 }),
    rating: varchar("rating", { length: 3 }).default("0.0"),
    address_id: bigint("address_id",{ mode: "number" }).references(() => address.address_id),
    registered_at: timestamp("registered_at").defaultNow(),
});