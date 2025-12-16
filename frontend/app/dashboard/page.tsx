'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check if token exists
    const token = Cookies.get('token');
    
    if (!token) {
      // If no token, kick them back to login
      router.push('/');
    } else {
      // Decode token roughly (optional) or just allow access
      setUser("User"); 
    }
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('token');
    router.push('/');
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Welcome to Dashboard</h1>
      <p>You are logged in!</p>
      
      <button 
        onClick={handleLogout}
        className="mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}