'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/axios';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();

  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Send credentials to backend
      const response = await authApi.post('/login', { email, password });

      // 2. Get token from response
      const { token } = response.data;

      // 3. Save token in cookies (expires in 1 day)
      Cookies.set('token', token, { expires: 1 });

      // 4. Redirect to home
      router.push('/home');

    } catch (err: any) {
      // Handle errors (e.g. "Invalid credentials")
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">

        {/* Logo or Title */}
        <div className="mb-6 text-center flex flex-col items-center justify-center">
          <Image
            src="/logo.svg"
            alt="VitaCheck Logo"
            width={300} // Adjust width as needed
            height={40} // Adjust height as needed
            priority // Optional: loads the logo immediately since it's above the fold
          />
          <p className="text-gray-500">Sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 p-2 text-black focus:border-[#23436aff] focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 p-2 text-black focus:border-[#23436aff] focus:outline-none"
            />
          </div>

          <div className="mb-6 text-center">
            <p className="text-gray-500">Don't have an account? Sign up <a href="/register" className="text-[#23436aff] hover:underline">here</a></p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded bg-[#4896bb] px-4 py-2 font-bold text-white hover:bg-[#23436aff] focus:outline-none ${loading ? 'cursor-not-allowed opacity-50' : ''
              }`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}