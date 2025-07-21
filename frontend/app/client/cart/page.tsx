"use client";
import React, { useEffect, useState } from "react";
import Header from "@/src/components/header";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import {apiUrl} from "@/src/config";

export default function Home() {
    // This page is for displaying the user's cart
    // It will show the items in the cart and allow the user to proceed to checkout
    // The cart data is stored in local storage
    const [cart, setCart] = useState<{ id: number; name: string; price: number; quantity: number }[]>([]);

    const sendOrderRequest = async () => {
        if (typeof window !== "undefined") {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            try {
                await fetchEventSource(`${apiUrl}/api/client-service/neworder`, {
                    method: "POST",
                    headers: {
                        Accept: "text/event-stream",
                        Connection: "keep-alive",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({
                        userId: localStorage.getItem('userId'),
                        role: "client",
                        items: cart,
                    }),
                    onopen: async (res) => {
                        if (res.ok && res.status === 200) {
                            console.log("Connection made ", res);
                        } else if (
                            res.status >= 400 &&
                            res.status < 500 &&
                            res.status !== 429
                        ) {
                            console.log("Client side error ", res);
                        }
                    },
                    onmessage(event) {
                        console.log(event.data);
                        const parsedData = JSON.parse(event.data);
                        if (parsedData.type === "PAIMENT_DECLINED") {
                            alert("Payment was declined. Please try again.");
                            // close the connection
                            return;
                        }
                        if (parsedData.type === "PAIMENT_VALIDATED") {
                            // redirect to order tracking page or show order details
                            localStorage.removeItem('cart');
                            setCart([]);
                            window.location.href = "client/track-order";
                        }
                    },
                    onclose() {
                        console.log("Connection closed by the server");
                    },
                    onerror(err) {
                        console.log("There was an error from server", err);
                    },
                });
            } catch (error) {
                console.error('Error sending order request:', error);
                alert("Failed to place order. Please try again.");
            }
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCart(storedCart);
        }
    }, []);
    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-top h-screen bg-gray-100">
                <Header/>
                <h1 className={"font-black italic"}>Your cart is empty</h1>
            </div>
        );
    } else {
        return (
            <div className="flex flex-col items-center justify-top h-screen bg-gray-100">
                <Header/>
                <h1 className={"font-black italic"}>Your Cart</h1>
                <div className="w-full max-w-7xl mx-auto p-4">
                    <ul className="space-y-4">
                        {cart.map((item: { id: number; name: string; price: number; quantity: number }) => (
                            <li key={item.id} className="bg-white p-4 rounded-lg shadow">
                                <h2 className="font-bold">{item.name}</h2>
                                <p>{item.price.toFixed(2)} €</p>
                                <p>Quantity: {item.quantity || 1}</p>
                            </li>
                        ))}
                    </ul>
                    <div className={
                        "mt-6 flex justify-between items-center bg-white p-4 rounded-lg shadow"
                    }>
                        <button
                            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition cursor-pointer"
                            // empty cart
                            onClick={
                                sendOrderRequest
                            }
                        >
                            Proceed to Checkout
                        </button>
                        <button
                            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition cursor-pointer"
                            // empty cart
                            onClick={
                                () => {
                                    localStorage.removeItem('cart');
                                    setCart([]);
                                    alert("Cart cleared!");
                                }
                            }
                        >
                            Clear Cart
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}