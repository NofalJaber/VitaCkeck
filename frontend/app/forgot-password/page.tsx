'use client';

import { useState } from 'react';
import { authApi } from '@/lib/axios';
import Image from 'next/image';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authApi.post('/forgot-password', { email });
      setMessage(response.data.message || 'If an account exists with that email, a reset link has been sent.');
      setEmail(''); // Golim input-ul după succes
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 text-center flex flex-col items-center justify-center">
          <Image
            src="/logo.svg"
            alt="VitaCheck Logo"
            width={200}
            height={30}
            priority
          />
          <h2 className="mt-4 text-xl font-bold text-[#23436aff]">Reset Password</h2>
          <p className="text-sm text-gray-500 mt-2">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-600">{error}</div>}
        {message && <div className="mb-4 rounded bg-green-100 p-3 text-sm text-green-700">{message}</div>}

        <form onSubmit={handleResetRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 p-2 text-black focus:border-[#23436aff] focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded bg-[#4896bb] px-4 py-2 font-bold text-white hover:bg-[#23436aff] focus:outline-none ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-[#23436aff] hover:underline">
              &larr; Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}