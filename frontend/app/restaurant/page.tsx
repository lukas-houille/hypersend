'use client'
import {useSearchParams} from 'next/navigation'
import Header from "@/src/components/header";
import {useEffect, useState} from "react";

interface RestaurantItems {
    restaurant: {
        id: number;
        name: string;
        description?: string;
    },
    items: {
        id: number;
        name: string;
        price: number;
        description?: string;
        img_url?: string;
    }[];
}

function addToCart(item: { id: number; name: string; price: number }) {
    // this function stores items in local storage
    // ensure cart items are from same restaurant
    // if the item is already in the cart with same special requests, update the quantity
    // otherwise, add the item to the cart
    return () => {
        if (typeof window !== 'undefined') {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingItemIndex = cart.findIndex((cartItem: { id: number; name: string; price: number }) => cartItem.id === item.id);
            if (existingItemIndex > -1) {
                // Item already exists, update quantity or special requests
                cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
            } else {
                // Add new item to cart
                cart.push({ ...item, quantity: 1 });
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            alert(`${item.name} added to cart!`);
        }
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
                console.error(response);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching restaurant:', error);
        }
    };
    const [data, setdata] = useState<RestaurantItems | null>(null);
    useEffect(() => {
        const getdata = async () => {
            const data = await fetchRestaurantAndItems(params.id);
            if (data) {
                setdata(data);
            }
        };
        getdata();
    }, [params.id]);

    return (
        <div className="flex flex-col items-center justify-start h-screen bg-gray-100">
            <Header/>
            {data ? (
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
                        <h1 className="text-2xl font-bold mb-4">{data.restaurant.name}</h1>
                        <p className="text-gray-700 mb-4">{data.restaurant.description}</p>
                    </div>
                    <div className="max-w-2xl w-screen p-4">
                        <h2 className="text-xl font-semibold mb-4">Menu Items</h2>
                        <div className="flex flex-row overflow-auto gap-4">
                            {data.items?.map((item) => (
                                <div key={item.id}
                                     className="bg-white w-lg p-4 rounded-lg shadow hover:shadow-lg">
                                    <img
                                        src={item.img_url || '/placeholder.png'}
                                        alt={item.name}
                                        className="w-full h-32 object-cover rounded mb-2"/>
                                    <h3 className="font-bold">{item.name}</h3>
                                    <p className="text-gray-600">{item.price.toFixed(2)} €</p>
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