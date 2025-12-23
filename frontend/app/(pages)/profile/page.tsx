'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { usersApi } from '@/lib/axios';

interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  cnp: string;
  phoneNumber: string;
  male: boolean;
  address: string;
  age: number;
}

export default function profile() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');

    if (!token) {
      router.push('/');
      return;
    }

    // Fetch user data from the backend
    const fetchUserData = async () => {
      try {
        const response = await usersApi.get('/profile');
        setUser(response.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('token');
    router.push('/');
  };

  if (loading) return <div className="p-8">Loading profile...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;



  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        {user && (
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold text-[#4896bb] border-b-1 border-black pb-2">User Profile</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-lg text-gray-900">{user.firstName} {user.lastName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg text-gray-900">{user.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-lg text-gray-900">{user.phoneNumber}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">CNP</label>
                <p className="text-lg text-gray-900">{user.cnp}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-lg text-gray-900">{user.address}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Demographics</label>
                <p className="text-lg text-gray-900">
                  {user.age} years old • {user.male ? 'Male' : 'Female'}
                </p>
              </div>

              <div className="mb-6 relative flex items-center justify-end">
                <button
                  onClick={handleLogout}
                  className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}