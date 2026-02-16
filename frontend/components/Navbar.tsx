'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/1 transition-opacity"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Side Menu */}
            <div
                className={`fixed left-0 top-0 z-40 h-full w-64 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full p-4">

                    <div className="flex items-center h-14">
                        <h1 className="ml-2 text-2xl font-bold text-[#23436aff]">Menu</h1>
                    </div>

                    {/* Separator Line */}
                    <div className="my-4 border-b border-gray-200"></div>

                    {/* Menu Links */}
                    <div className="flex flex-col space-y-2">
                        {/* New Medical Tests Page Link */}
                        <Link
                            href="/tests"
                            className="rounded-md px-4 py-2 text-left text-gray-700 transition hover:bg-gray-100 hover:text-blue-600"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            My Medical Tests
                        </Link>

                        {/* Placeholder Button */}
                        <button
                            className="rounded-md px-4 py-2 text-left text-gray-700 transition hover:bg-gray-100 hover:text-blue-600"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Future Page 2
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <nav className="relative flex items-center justify-between bg-white p-4 shadow-sm">

                {/* Menu Toggle Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`z-50 flex items-center justify-center rounded-full p-2 text-gray-700 transition-transform duration-300 ease-in-out hover:bg-gray-100 ${isMenuOpen ? 'translate-x-46' : 'translate-x-0'
                        }`}
                    title={isMenuOpen ? "Close Menu" : "Open Menu"}
                >
                    {isMenuOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>

                {/* Center Title */}
                <Link
                    href="/home"
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
                >
                    <Image
                        src="/logo.svg"
                        alt="VitaCheck Logo"
                        width={210}
                        height={40}
                        priority
                    />
                </Link>

                {/* Right Profile Section */}
                <Link
                    href="/profile"
                    className="z-10 flex items-center gap-2 rounded-full p-2 text-gray-700 transition hover:bg-gray-100"
                    title="Go to Profile"
                >
                    <div className="rounded-full bg-[#4896bb] p-2 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <span className="hidden font-medium sm:block">My Profile</span>
                </Link>

            </nav>
        </>
    );
}