import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="relative flex items-center justify-end bg-white p-4 shadow-sm">

            <Link
                href="/profile"
                className="z-10 flex items-center gap-2 rounded-full p-2 text-gray-700 transition hover:bg-gray-100"
                title="Go to Profile"
            >
                <div className="rounded-full bg-blue-600 p-2 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <span className="hidden font-medium sm:block">My Profile</span>
            </Link>

            <Link
                href="/home"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
            >
                <h1 className="text-3xl font-bold text-blue-600">VitaCheck</h1>
            </Link>

        </nav>
    );
}