import {bigint, pgTable, varchar} from "drizzle-orm/pg-core";

export const restaurantType = pgTable("restaurant_type", {
    restaurant_type_id: bigint("restaurant_type_id",{mode:"number"}).primaryKey(),
    type_name: varchar("type_name", { length: 50 }).notNull().unique(),
});