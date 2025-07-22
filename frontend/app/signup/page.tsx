"use client";
import { useRouter } from 'next/navigation';

import LogoFull from '@/src/icons/logoFull.jsx';
import React from "react";

export default function SignUp() {
    const router = useRouter();
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get('email');
        const password = formData.get('password');

        const response = await fetch(`api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "email":email, "password":password, "role": "client"}), // TODO remove hardcoded role
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('userId', data.userId);
            // Redirect or update UI as needed
            router.push(`/${data.role}`);
        } else {
            // Handle error (show message, etc.)
            const errorData = await response.json();
            console.error('Login failed:', errorData);
        }
    }
    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <LogoFull className="w-full h-9 fill-primary dark:fill-dark"/>
                <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-dark">
                    Sign in to your account
                </h2>
            </div>
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm/6 font-medium text-dark">
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                placeholder="Enter your email"
                                className="block w-full rounded-md px-3 py-1.5 text-base text-dark outline-1 -outline-offset-1 outline-gray placeholder:text-dark-gray focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm/6 font-medium text-dark">
                                Password
                            </label>
                            <div className="text-sm">
                                <a href="#" className="text-primary font-semibold  hover:text-primary-hover">
                                    Forgot password?
                                </a>
                            </div>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                className="block w-full rounded-md bg-light px-3 py-1.5 text-base text-dark outline-1 -outline-offset-1 outline-gray placeholder:text-dark-gray focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm/6 font-semibold text-light shadow-xs hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                            Sign in
                        </button>
                    </div>
                </form>

                <p className="mt-10 text-center text-sm/6 text-dark-gray">
                    Already have an account?{' '}
                    <a href="/signin" className="font-semibold text-primary hover:text-primary-hover">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    )
}