"use client";
import Header from '../../src/components/header';
import { useEffect, useState } from 'react';

interface RestaurantType {
    id: number;
    name: string;
    type: string;
    img_url: string;
    description?: string; // Optional field for description
}

export default function Home() {

    // get restaurant data from the api hypersend.com/api/restaurants
    // and display it in a grid format with images, names, and descriptions
    // use the fetch API to get the data

    const fetchRestaurants = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/restaurants/');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        }
    };

    const [restaurants, setRestaurants] = useState<RestaurantType[]>([]);
    useEffect(() => {
        const getRestaurants = async () => {
            const data = await fetchRestaurants();
            if (data) {
                setRestaurants(data);
            }
        };
        getRestaurants();
    }, []);

    return (
        <div className="flex flex-col items-center justify-top h-screen bg-gray-100">
            <Header/>
            <div className="flex flex-col w-full px-2 sm:px-4 md:px-8">
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-7xl mx-auto p-4">
                    {restaurants.map((restaurant) => (
                        <a
                            key={restaurant.id}
                            href={`/restaurant?id=${restaurant.id}`}
                            className="bg-white p-4 rounded-lg shadow hover:bg-gray-50 transition flex flex-col items-center"
                        >
                            <img
                                src={restaurant.img_url}
                                alt={restaurant.name}
                                className="w-full h-32 object-cover rounded mb-2"
                            />
                            <h2 className="font-bold mt-2 text-center">{restaurant.name}</h2>
                            <p className="text-gray-600 text-center">{restaurant.type}</p>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}