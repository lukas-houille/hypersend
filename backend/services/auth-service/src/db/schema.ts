import {bigint, date, pgTable, serial, timestamp, varchar} from "drizzle-orm/pg-core";

export const client = pgTable("clients", {
    id: bigint("client_id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    email: varchar("email", { length: 256 }).notNull().unique(),
    password_hash: varchar("password_hash", { length: 256 }).notNull(),
    first_name: varchar("first_name", { length: 50 }),
    last_name: varchar("last_name", { length: 50 }),
    date_of_birth: date("date_of_birth"),
    phone_number: varchar("phone_number", { length: 15 }),
    address_id: serial("address_id").references(() => address.address_id),
    registered_at: timestamp("registered_at").defaultNow(),
});

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

export const restaurant = pgTable("restaurants", {
    id: bigint("restaurant_id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    email: varchar("email", { length: 256 }).notNull().unique(),
    password_hash: varchar("password_hash", { length: 256 }).notNull(),
    name: varchar("name", { length: 100 }),
    phone_number: varchar("phone_number", { length: 15 }),
    type: serial("type").references(() => restaurantType.restaurant_type_id),
    address_id: serial("address_id").references(() => address.address_id),
    opening_hours: varchar("opening_hours", { length: 255 }),
    opening_days: varchar("opening_days", { length: 255 }),
    rating: varchar("rating", { length: 3 }).default("0.0"),
    registered_at: timestamp("registered_at").defaultNow(),
});

export const address = pgTable("address", {
    address_id: serial("address_id").primaryKey(),
    street: varchar("street", { length: 100 }).notNull(),
    city: varchar("city", { length: 50 }).notNull(),
    state: varchar("state", { length: 50 }),
    postal_code: varchar("postal_code", { length: 20 }),
    country: varchar("country", { length: 50 }).notNull(),
});

export const restaurantType = pgTable("restaurant_type", {
    restaurant_type_id: serial("restaurant_type_id").primaryKey(),
    type_name: varchar("type_name", { length: 50 }).notNull().unique(),
});

export const roleTable: { [key: string]: typeof client | typeof driver | typeof restaurant } = {
    "client": client,
    "driver": driver,
    "restaurant": restaurant
};