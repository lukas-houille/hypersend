import Link from "next/link";
import Logo from "@/src/icons/logoFull";

export default function Header() {
    return (
        <header className="flex w-screen items-center justify-between p-4 bg-white shadow-md">
            <Link href="/" className="flex items-center">
                <Logo className="h-6 w-auto fill-primary" aria-label="Logo" />
            </Link>
            <nav className="space-x-4">
                <Link href="/profile" className="text-dark hover:text-primary">Profile</Link>
                <Link href="/client/cart" className="text-dark hover:text-primary">Cart</Link>
            </nav>
        </header>
    );
}