import Header from "@/src/components/header";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-start h-screen bg-gray-100">
                <Header/>
            <h1 className={"font-black italic"}>Your profile would appear here</h1>
        </div>
    );
}