import express from "express";

export const restaurantRoute = express.Router();

restaurantRoute.get("/", (req, res) => {
    // This is a placeholder for actual restaurant data
    const restaurants = [
        { id: 1, name: "Pizza Place", type: "Italian", img_url: "https://example.com/pizza.jpg" },
        { id: 2, name: "Sushi Spot", type: "Japanese", img_url: "https://example.com/sushi.jpg" },
        { id: 3, name: "Burger Joint", type: "American", img_url: "https://example.com/burger.jpg" },
    ];
    res.status(200).json(restaurants);
});

restaurantRoute.get("/:id", (req, res) => {
    const restaurantId = parseInt(req.params.id, 10);
    // This is a placeholder for actual restaurant data
    const restaurant = {
        id: restaurantId,
        name: "Pizza Place",
        type: "Italian",
        img_url: "https://example.com/pizza.jpg",
        description: "Delicious pizza with fresh ingredients."
        // items list
        , items: [
            { id: 1, name: "Margherita Pizza", price: 10.99, description: "Classic pizza with tomatoes, mozzarella, and basil.", img_url: "https://example.com/margherita.jpg" },
            { id: 2, name: "Pepperoni Pizza", price: 12.99, description: "Spicy pepperoni with mozzarella cheese.", img_url: "https://example.com/pepperoni.jpg" },
            { id: 3, name: "Veggie Pizza", price: 11.99, description: "Loaded with fresh vegetables.", img_url: "https://example.com/veggie.jpg" }
        ]
    };

    if (restaurant.id === restaurantId) {
        res.status(200).json(restaurant);
    } else {
        res.status(404).json({ message: "Restaurant not found" });
    }
});