'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { userApi } from '@/lib/axios';

// Interface matching your backend UserResponse
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

export default function Profile() {
  const router = useRouter();

  // State for View Mode
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // State for Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  // Status Messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Fetch Data
  const fetchUserData = async () => {
    try {
      const response = await userApi.get('/profile');
      setUser(response.data);
      setFormData(response.data);
    } catch (err) {
      console.error("Failed to fetch user", err);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/');
      return;
    }
    fetchUserData();
  }, [router]);

  // 2. Handle Logout
  const handleLogout = () => {
    Cookies.remove('token');
    router.push('/');
  };

  // 3. Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 4. Handle Gender Change
  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const isMale = e.target.value === 'true';
    setFormData(prev => ({ ...prev, male: isMale }));
  };

  // 5. Submit Updates
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!formData) return;

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        cnp: formData.cnp,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        age: Number(formData.age),
        male: formData.male
      };

      await userApi.put('/profile', payload);

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      fetchUserData();

    } catch (err: any) {
      const msg = err.response?.data || "Failed to update profile.";
      setError(msg);
    }
  };

  if (loading) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center justify-between mb-4 border-b border-black pb-2">
            <h2 className="text-xl font-bold text-[#4896bb]">
              {isEditing ? 'Edit Profile' : 'User Profile'}
            </h2>
            {!isEditing && (
              <button
                onClick={() => (setIsEditing(true), setError(''), setSuccess(''))}
                className="text-sm bg-[#4896bb] text-white px-3 py-1 rounded hover:bg-[#3a7ca0]"
              >
                Edit
              </button>
            )}
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-200">{success}</div>}

          {user && !isEditing ? (
            // === VIEW MODE ===
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

              <div className="col-span-1 md:col-span-2 flex justify-end mt-4">
                <button
                  onClick={handleLogout}
                  className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            // === EDIT MODE ===
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Email - Read Only */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Email (Cannot be changed)</label>
                <input
                  type="text"
                  value={user?.email || ''}
                  disabled
                  className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleChange}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 text-black focus:border-[#23436aff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleChange}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 text-black focus:border-[#23436aff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleChange}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 text-black focus:border-[#23436aff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CNP</label>
                <input
                  name="cnp"
                  value={formData.cnp || ''}
                  onChange={handleChange}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 text-black focus:border-[#23436aff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  name="age"
                  type="number"
                  value={formData.age || ''}
                  onChange={handleChange}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 text-black focus:border-[#23436aff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="male"
                  value={formData.male ? 'true' : 'false'}
                  onChange={handleGenderChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-black focus:border-[#23436aff] focus:outline-none"
                >
                  <option value="true">Male</option>
                  <option value="false">Female</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-black focus:border-[#23436aff] focus:outline-none"
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setError('');
                    setFormData(user || {});
                  }}
                  className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#4896bb] px-4 py-2 text-white hover:bg-[#3a7ca0] transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}