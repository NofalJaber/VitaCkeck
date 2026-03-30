'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, userApi } from '@/lib/axios';

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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUserData = async () => {
    try {
      const response = await userApi.get('/profile');
      setUser(response.data);
      setFormData(response.data);
    } catch (err) {
      console.error('Failed to fetch user', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await authApi.post('/logout');
    router.push('/');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const isMale = e.target.value === 'true';
    setFormData(prev => ({ ...prev, male: isMale }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

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
      const msg = err.response?.data || 'Failed to update profile.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage your personal information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {/* Profile Header */}
        <div className="bg-primary/5 border-b border-border p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4 w-full">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xl md:text-2xl font-bold shrink-0">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="overflow-hidden">
                <h2 className="text-lg md:text-xl font-semibold text-foreground truncate">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-sm md:text-base text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setError('');
                  setSuccess('');
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="p-4 md:p-6 pb-0">
          {error && (
            <div className="mb-4 md:mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 md:mb-6 rounded-lg bg-success/10 border border-success/20 p-4 text-sm text-success flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {user && !isEditing ? (
            // View Mode
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-1 bg-muted/30 p-3 rounded-lg sm:bg-transparent sm:p-0">
                <label className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider sm:normal-case sm:tracking-normal">Full Name</label>
                <p className="text-foreground font-medium text-sm md:text-base">{user.firstName} {user.lastName}</p>
              </div>

              <div className="space-y-1 bg-muted/30 p-3 rounded-lg sm:bg-transparent sm:p-0">
                <label className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider sm:normal-case sm:tracking-normal">Email Address</label>
                <p className="text-foreground font-medium text-sm md:text-base break-all">{user.email}</p>
              </div>

              <div className="space-y-1 bg-muted/30 p-3 rounded-lg sm:bg-transparent sm:p-0">
                <label className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider sm:normal-case sm:tracking-normal">Phone Number</label>
                <p className="text-foreground font-medium text-sm md:text-base">{user.phoneNumber}</p>
              </div>

              <div className="space-y-1 bg-muted/30 p-3 rounded-lg sm:bg-transparent sm:p-0">
                <label className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider sm:normal-case sm:tracking-normal">CNP</label>
                <p className="text-foreground font-medium text-sm md:text-base">{user.cnp}</p>
              </div>

              <div className="space-y-1 bg-muted/30 p-3 rounded-lg sm:bg-transparent sm:p-0 sm:col-span-2 md:col-span-1">
                <label className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider sm:normal-case sm:tracking-normal">Demographics</label>
                <p className="text-foreground font-medium text-sm md:text-base">
                  {user.age} years old - {user.male ? 'Male' : 'Female'}
                </p>
              </div>

              <div className="space-y-1 bg-muted/30 p-3 rounded-lg sm:bg-transparent sm:p-0 sm:col-span-2">
                <label className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider sm:normal-case sm:tracking-normal">Address</label>
                <p className="text-foreground font-medium text-sm md:text-base">{user.address || 'Not provided'}</p>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="sm:col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-foreground mb-1 md:mb-2">Email (cannot be changed)</label>
                  <input
                    type="text"
                    value={user?.email || ''}
                    disabled
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2 md:px-4 md:py-3 text-sm md:text-base text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div className="hidden md:block" />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1 md:mb-2">First Name</label>
                  <input
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 md:px-4 md:py-3 text-sm md:text-base text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1 md:mb-2">Last Name</label>
                  <input
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 md:px-4 md:py-3 text-sm md:text-base text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1 md:mb-2">Phone Number</label>
                  <input
                    name="phoneNumber"
                    value={formData.phoneNumber || ''}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 md:px-4 md:py-3 text-sm md:text-base text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1 md:mb-2">CNP</label>
                  <input
                    name="cnp"
                    value={formData.cnp || ''}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 md:px-4 md:py-3 text-sm md:text-base text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1 md:mb-2">Age</label>
                  <input
                    name="age"
                    type="number"
                    value={formData.age || ''}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 md:px-4 md:py-3 text-sm md:text-base text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1 md:mb-2">Gender</label>
                  <select
                    name="male"
                    value={formData.male ? 'true' : 'false'}
                    onChange={handleGenderChange}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 md:px-4 md:py-3 text-sm md:text-base text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  >
                    <option value="true">Male</option>
                    <option value="false">Female</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1 md:mb-2">Address</label>
                  <textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 md:px-4 md:py-3 text-sm md:text-base text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 mt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setError('');
                    setFormData(user || {});
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg border border-border bg-card text-foreground font-medium hover:bg-muted transition-colors text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full sm:w-auto px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      {!isEditing && (
        <div className="mt-6 md:mt-8 bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-1 md:mb-2">Account Actions</h3>
          <p className="text-muted-foreground text-xs md:text-sm mb-4">Sign out from your account on this device.</p>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}