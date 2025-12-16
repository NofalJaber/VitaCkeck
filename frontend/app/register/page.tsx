'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function RegisterPage() {
    const router = useRouter();

    // State for form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [cnp, setCnp] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isMale, setIsMale] = useState<boolean | null>(null);
    const [address, setAddress] = useState('');
    const [age, setAge] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Check if passwords match
            console.log(password, confirmPassword);
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return
            }
            console.log("Passwords match");
            // 1. Send credentials to backend
            const response = await api.post('/register', { email, password, cnp, firstName, lastName, phoneNumber, isMale: isMale, address, age });

            // 2. Get message from response
            const { message } = response.data;

            // 3. Redirect to login
            router.push('/');

        } catch (err: any) {
            console.log(err.response);

            const errorMessage =
                err.response?.data ||
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Registration failed';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">

                {/* Logo or Title */}
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-bold text-blue-600">VitaCheck</h1>
                    <p className="text-gray-500">Register account</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">FirstName</label>
                            <input
                                type="text"
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="mt-1 block w-full rounded border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">LastName</label>
                            <input
                                type="text"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="mt-1 block w-full rounded border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full rounded border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">CNP (National Identity Card)</label>
                        <input
                            type="text"
                            required
                            value={cnp}
                            onChange={(e) => setCnp(e.target.value)}
                            className="mt-1 block w-full rounded border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="text"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="mt-1 block w-full rounded border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address*</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="mt-1 block w-full rounded border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Age*</label>
                            <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                className="mt-1 block w-full rounded border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Gender</label>
                            <select
                                value={isMale === null ? "" : (isMale ? 'male' : 'female')}

                                onChange={(e) => {
                                    if (e.target.value === 'male') setIsMale(true);
                                    if (e.target.value === 'female') setIsMale(false);
                                }}
                                required
                                className="mt-1 block w-full rounded border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none"
                            >
                                <option value="" disabled>Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full rounded border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="mb-6 text-center">
                        <p className="text-gray-500">Already have an account? Sign in <a href="/" className="text-blue-600 hover:underline">here</a></p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none ${loading ? 'cursor-not-allowed opacity-50' : ''
                            }`}
                    >
                        {loading ? 'Signing in...' : 'Sign Up'}
                    </button>
                </form>
            </div>
        </div>
    );
}