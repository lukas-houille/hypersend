import express from "express";
import {db} from "../db";
import {restaurant} from "../db/restaurant";
import {eq, and} from "drizzle-orm";
import {items} from "../db/items";

export const restaurantRoute = express.Router();

restaurantRoute.get("/", async (req, res) => {
    // This is a placeholder for actual restaurant data
    const selectedRestaurants = await db.select().from(restaurant).limit(10);
    res.status(200).json(selectedRestaurants);
});

restaurantRoute.get("/:id", async (req, res) => {
    const restaurantId = parseInt(req.params.id, 10);
    // This is a placeholder for actual restaurant data
    const selectedRestaurant = await db.select().from(restaurant).where(eq(restaurant.id, restaurantId)).limit(1);
    if (selectedRestaurant.length !== 0) {
        const restaurantItems = await db.select().from(items).where(and(eq(items.restaurant_id, restaurantId), items.available));
        const jsonResponse = {
            restaurant: selectedRestaurant[0],
            items: restaurantItems
        }
        res.status(200).json(jsonResponse);
    } else {
        res.status(404).json({ message: "Restaurant not found" });
    }
});