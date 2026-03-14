'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { testsApi, userApi } from '@/lib/axios';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';

interface MedicalTest {
  id: number;
  fileName: string;
  fileType: string;
  uploadDate: string;
}

interface Measurement {
  collection_date: string;
  numeric_value: number;
  string_value?: string;
  medical_test_id: number;
  file_name: string;
}

interface AnalyticsData {
  test_name: string;
  um: string;
  min_reference: number | null;
  max_reference: number | null;
  measurements: Measurement[];
}

interface UserProfile {
  firstName: string;
  lastName: string;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [recentTests, setRecentTests] = useState<MedicalTest[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, testsRes, analyticsRes] = await Promise.all([
          userApi.get('/profile'),
          testsApi.get(''),
          testsApi.get('/analytics')
        ]);
        setUser(userRes.data);
        setRecentTests(testsRes.data.slice(0, 5));
        setAnalytics(analyticsRes.data.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await testsApi.post('/upload', formData);
      setUploadMessage('Test uploaded successfully!');
      const testsRes = await testsApi.get('');
      setRecentTests(testsRes.data.slice(0, 5));
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      setUploadMessage(error.response?.data || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handlePointClick = (pointData: any, testName: string) => {
    const medical_test_id = pointData.test_id || pointData.medical_test_id;
    const fileName = pointData.file_name || pointData.fileName || 'Medical_Document.pdf';
    if (medical_test_id) {
      router.push(`/tests/${medical_test_id}?name=${encodeURIComponent(fileName)}&highlight=${encodeURIComponent(testName)}`);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="text-muted-foreground text-xs mb-1">{payload[0].payload.collection_date}</p>
          <p className="font-semibold text-foreground">
            {payload[0].value} {payload[0].payload.um}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back{user ? `, ${user.firstName}` : ''}
        </h1>
        <p className="text-muted-foreground mt-1">
          {"Here's an overview of your health data"}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Upload Card */}
        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Upload Test</h3>
              <p className="text-sm text-muted-foreground">Add a new medical test</p>
            </div>
          </div>
          <label className="mt-4 block">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className={`block w-full text-center py-2.5 px-4 rounded-lg border-2 border-dashed border-border bg-muted/50 text-sm font-medium cursor-pointer hover:border-primary hover:bg-primary/5 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {uploading ? 'Uploading...' : 'Choose PDF file'}
            </span>
          </label>
          {uploadMessage && (
            <p className={`mt-2 text-sm ${uploadMessage.includes('success') ? 'text-success' : 'text-destructive'}`}>
              {uploadMessage}
            </p>
          )}
        </div>

        {/* View All Tests */}
        <Link href="/tests" className="bg-card border border-border rounded-xl p-6 hover:shadow-md hover:border-primary/30 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">My Tests</h3>
              <p className="text-sm text-muted-foreground">View all uploaded tests</p>
            </div>
            <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* View Analytics */}
        <Link href="/analytics" className="bg-card border border-border rounded-xl p-6 hover:shadow-md hover:border-primary/30 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Analytics</h3>
              <p className="text-sm text-muted-foreground">View detailed graphs</p>
            </div>
            <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Quick Charts Section */}
      {analytics.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Health Trends</h2>
            <Link href="/analytics" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
              View all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {analytics.map((item, idx) => {
              const values = item.measurements.map(m => m.numeric_value);
              const actualDataMin = values.length > 0 ? Math.min(...values) : 0;
              const actualDataMax = values.length > 0 ? Math.max(...values) : 10;
              const minLimit = item.min_reference !== null ? item.min_reference : actualDataMin;
              const maxLimit = item.max_reference !== null ? item.max_reference : actualDataMax;
              let padding = 0;
              if (item.min_reference !== null && item.max_reference !== null) {
                padding = (item.max_reference - item.min_reference) * 0.5;
              } else {
                padding = (maxLimit - minLimit) * 0.2;
                if (padding === 0) padding = maxLimit * 0.2;
              }
              let calculatedBottom = minLimit - padding;
              if (minLimit === 0 || (calculatedBottom < 0 && minLimit >= 0)) {
                calculatedBottom = 0;
              }
              const finalBottom = Math.min(actualDataMin, calculatedBottom);
              const finalTop = Math.max(actualDataMax, maxLimit + padding);
              const yAxisMin = finalBottom === 0 ? 0 : finalBottom - Math.abs(finalBottom * 0.05);
              const yAxisMax = finalTop + Math.abs(finalTop * 0.05);

              return (
                <div key={idx} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{item.test_name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Unit: {item.um || 'N/A'}</p>
                    </div>
                    <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
                      {item.min_reference !== null ? item.min_reference : 'Min'} - {item.max_reference !== null ? item.max_reference : 'Max'}
                    </span>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={item.measurements.map(m => ({ ...m, um: item.um }))} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="collection_date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis domain={[yAxisMin, yAxisMax]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={40} tickFormatter={(value) => parseFloat(value.toFixed(1)).toString()} />
                        <Tooltip content={<CustomTooltip />} />
                        {item.min_reference !== null && item.max_reference !== null && (
                          <ReferenceArea y1={item.min_reference} y2={item.max_reference} fill="#10b981" fillOpacity={0.1} />
                        )}
                        <Line
                          type="monotone"
                          dataKey="numeric_value"
                          stroke="#4896bb"
                          strokeWidth={2}
                          dot={{ r: 4, fill: '#4896bb', strokeWidth: 2, stroke: '#ffffff' }}
                          activeDot={(props: any) => {
                            const { cx, cy, payload } = props;
                            return (
                              <circle
                                cx={cx} cy={cy} r={6}
                                fill="#10b981"
                                stroke="white" strokeWidth={2}
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePointClick(payload, item.test_name);
                                }}
                              />
                            );
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Tests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Recent Tests</h2>
          <Link href="/tests" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        {recentTests.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">No tests uploaded yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Upload your first medical test to get started</p>
            <label className="inline-block">
              <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium cursor-pointer hover:bg-primary/90 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Test
              </span>
            </label>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <ul className="divide-y divide-border">
              {recentTests.map((test) => (
                <li key={test.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-destructive" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-3 9v6h2v-4h2l-3-3-3 3h2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{test.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded on {new Date(test.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/tests/${test.id}?name=${encodeURIComponent(test.fileName)}`)}
                      className="text-sm px-3 py-1.5 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 font-medium transition-colors"
                    >
                      View
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
