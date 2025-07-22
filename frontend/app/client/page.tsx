"use client";
import Header from '../../src/components/header';
import {useEffect, useState} from 'react';
import Image from "next/image";

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
            const response = await fetch(`/api/restaurants/`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            if (!response.ok) {
                console.error("Failed to fetch restaurants:", response.statusText);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            return [];
        }
    };

    const [restaurants, setRestaurants] = useState<RestaurantType[]>([]);
    useEffect(() => {
        const getRestaurants = async () => {
            const data = await fetchRestaurants();
            if (Array.isArray(data)) {
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
                            href={`/client/restaurant?id=${restaurant.id}`}
                            className="bg-white p-4 rounded-lg shadow hover:bg-gray-50 transition flex flex-col items-center"
                        >
                            <Image
                                src={restaurant.img_url ? restaurant.img_url : '/placeholder.png'}
                                alt={restaurant.name}
                                width={200}
                                height={128}
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