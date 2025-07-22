"use client";
import { useSearchParams } from "next/navigation";
import Header from "@/src/components/header";
import { useEffect, useState } from "react";
import { apiUrl } from "@/src/config";
import Image from "next/image";

interface RestaurantItems {
  restaurant: {
    id: number;
    name: string;
    description?: string;
  };
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
    if (typeof window !== "undefined") {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingItemIndex = cart.findIndex(
        (cartItem: { id: number; name: string; price: number }) =>
          cartItem.id === item.id
      );
      if (existingItemIndex > -1) {
        // Item already exists, update quantity or special requests
        cart[existingItemIndex].quantity =
          (cart[existingItemIndex].quantity || 1) + 1;
      } else {
        // Add new item to cart
        cart.push({ ...item, quantity: 1 });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`${item.name} added to cart!`);
    }
  };
}

export default function RestaurantPageContent() {
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const [data, setdata] = useState<RestaurantItems | null>(null);

  useEffect(() => {
    const fetchRestaurantAndItems = async (id: string) => {
      try {
        const response = await fetch(`${apiUrl}/api/restaurants/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          console.error(response);
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching restaurant:", error);
      }
    };

    if (params.id) {
      const getdata = async () => {
        const data = await fetchRestaurantAndItems(params.id);
        if (data) {
          setdata(data);
        }
      };
      getdata();
    }
  }, [params.id]);

  if (!params.id) {
    return (
      <div className="flex flex-col items-center justify-top h-screen bg-gray-100">
        <Header />
        <h1 className={"font-black italic"}>No restaurant selected</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start h-screen bg-gray-100">
      <Header />
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
            <h1 className="text-3xl font-bold mb-2">{data.restaurant.name}</h1>
            <p className="text-gray-600">{data.restaurant.description}</p>
          </div>
          <div className="max-w-2xl p-4">
            <h2 className="text-2xl font-bold mb-4">Menu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md p-4 flex flex-col"
                >
                  {item.img_url && (
                    <div className="w-full h-48 mb-4 relative">
                      <Image
                        src={item.img_url}
                        alt={item.name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-t-lg"
                      />
                    </div>
                  )}
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                    <p className="text-gray-600 mb-2">{item.description}</p>
                    <p className="text-lg font-bold text-primary">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <button
                    className="mt-4 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition cursor-pointer"
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
        <p>Loading...</p>
      )}
    </div>
  );
}

