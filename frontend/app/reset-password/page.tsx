'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authApi } from '@/lib/axios';
import Image from 'next/image';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Dacă utilizatorul accesează pagina fără token în URL
  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.post('/reset-password', { 
        token, 
        newPassword 
      });
      setMessage(response.data.message || 'Password successfully reset.');
      
      // Redirect la login după 3 secunde pentru UX bun
      setTimeout(() => {
        router.push('/');
      }, 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. The link might be expired.');
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
          <h2 className="mt-4 text-xl font-bold text-[#23436aff]">Create New Password</h2>
        </div>

        {error && <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-600">{error}</div>}
        {message && <div className="mb-4 rounded bg-green-100 p-3 text-sm text-green-700">{message} Redirecting to login...</div>}

        {!message && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                required
                disabled={!token}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded border border-gray-300 p-2 text-black focus:border-[#23436aff] focus:outline-none disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                required
                disabled={!token}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded border border-gray-300 p-2 text-black focus:border-[#23436aff] focus:outline-none disabled:bg-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className={`w-full rounded bg-[#4896bb] px-4 py-2 font-bold text-white hover:bg-[#23436aff] focus:outline-none ${loading || !token ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-[#23436aff] hover:underline">
            &larr; Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}