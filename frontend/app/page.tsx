"use client";

import Header from "@/src/components/header";

export default function Home() {
    return (
    <div className="flex flex-col items-center justify-start h-screen bg-gray-100">
    <Header/>
        <h1 className={"font-black italic"}>& HYPERSEND</h1>
        <button
            className="mt-6 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition cursor-pointer"
            onClick={() => window.location.href = '/browse'}
        >
            Shop Now
        </button>
    </div>
)
    ;
}