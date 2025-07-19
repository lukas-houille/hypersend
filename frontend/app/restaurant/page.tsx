'use client'

import { useSearchParams } from 'next/navigation'
import Header from "@/src/components/header";
import {useEffect, useState} from "react";

interface RestaurantItems {
    id: number;
    name: string;
    type: string;
    description?: string;
    // items list
    items?: {
        id: number;
        name: string;
        price: number;
        description?: string;
        img_url?: string;
    }[];
}

function addToCart(item: { id: number; name: string; price: number }) {
    // this function stores items in local storage
    return () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart.push(item);
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${item.name} has been added to your cart!`);
    };
}

export default function Home() {
    const searchParams = useSearchParams();
    const params = Object.fromEntries(searchParams.entries());
    if (!params.id) {
        return <div className="flex flex-col items-center justify-top h-screen bg-gray-100">
            <Header/>
            <h1 className={"font-black italic"}>No restaurant selected</h1>
        </div>;
    }
    // try to fetch restaurant data using params.id
    const fetchRestaurantAndItems = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:3001/api/restaurants/${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching restaurant:', error);
        }
    };
    const [restaurant, setRestaurant] = useState<RestaurantItems[]>([]);
    useEffect(() => {
        const getRestaurant = async () => {
            const data = await fetchRestaurantAndItems(params.id);
            if (data) {
                setRestaurant(data);
            }
        };
        getRestaurant();
    }, [params.id]);

    return (
        <div className="flex flex-col items-center justify-start h-screen bg-gray-100">
            <Header/>
            {restaurant ? (
                <div className="flex flex-col w-screen">
                    <div className="max-w-2xl p-4">
                        <button
                            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition cursor-pointer"
                            onClick={() => window.history.back()}
                        >
                            Back to Restaurants
                        </button>
                    </div>
                    <div className="max-w-2xl p-4">
                        <h1 className="text-2xl font-bold mb-4">{restaurant.name}</h1>
                        <p className="text-gray-700 mb-4">{restaurant.description}</p>
                        <p className="text-gray-600">Type: {restaurant.type}</p>
                    </div>
                    <div className="max-w-2xl w-screen p-4">
                        <h2 className="text-xl font-semibold mb-4">Menu Items</h2>
                        <div className="flex flex-row overflow-auto gap-4">
                            {restaurant.items?.map((item) => (
                                <div key={item.id}
                                     className="bg-white w-lg p-4 rounded-lg shadow hover:shadow-lg">
                                    <img
                                        src={item.img_url || '/placeholder.png'}
                                        alt={item.name}
                                        className="w-full h-32 object-cover rounded mb-2"/>
                                    <h3 className="font-bold">{item.name}</h3>
                                    <p className="text-gray-600">${item.price.toFixed(2)}</p>
                                    {item.description && <p className="text-gray-500 text-sm">{item.description}</p>}
                                    <button
                                        className="mt-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition cursor-pointer"
                                        onClick={addToCart(item)}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <h1 className={"font-black italic"}>Loading restaurant details...</h1>
            )}
        </div>
    );
}