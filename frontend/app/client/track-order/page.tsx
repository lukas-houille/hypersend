"use client";
import { useState, useEffect } from 'react';
import { fetchEventSource } from "@microsoft/fetch-event-source";
import Header from "@/src/components/header";

interface OrderEvent {
    type: string;
    order: {
        delivered_at?: string | null;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

export default function SSEPage() {
    const [orderData, setOrderData] = useState<OrderEvent[]>([]);

    useEffect(() => {
        const trackOrder = async () => {
            try {
                await fetchEventSource(`/api/client-service/orderTracking`, {
                    method: "POST",
                    headers: {
                        Accept: "text/event-stream",
                        Connection: "keep-alive",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId: localStorage.getItem("userId"),
                        role: "client",
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
                        if (event.data) {
                            try {
                                // type is UPDATE and delivered_at is not null
                                const parsedData: OrderEvent = JSON.parse(event.data);
                                console.log(parsedData);
                                if (parsedData.type === "UPDATE" && parsedData.order.delivered_at) {
                                    alert("Your order has been delivered!");
                                    window.location.href = "/client/";
                                }
                                setOrderData(prev => [...prev, parsedData]);
                            } catch (e) {
                                console.error("Failed to parse event data:", event.data, e);
                            }
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
                alert("Failed to track order. Please try again.");
            }
        };
        trackOrder();
    }, []);

    return (
        <div className="flex flex-col items-center justify-top h-screen bg-gray-100">
            <Header />
            <h1 className={"font-black italic"}>SSE Page</h1>
            <div className="mt-4">
                {orderData.map((order, index) => (
                    <div key={index} className="p-4 bg-white shadow rounded mb-2">
                        <pre>{JSON.stringify(order, null, 2)}</pre>
                    </div>
                ))}
            </div>
        </div>
    );
}