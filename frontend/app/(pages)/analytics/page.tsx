"use client";

import { useEffect, useState } from "react";
import { testsApi } from "@/lib/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea
} from "recharts";
import { useRouter } from "next/navigation";

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

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await testsApi.get("/analytics");
        setData(response.data);
      } catch (err) {
        console.error("Failed to load analytics", err);
        setError("Failed to load medical history.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="text-muted-foreground text-xs mb-1">{payload[0].payload.collection_date}</p>
          <p className="font-semibold text-foreground">
            {payload[0].value} {payload[0].payload.um}
          </p>
          <p className="text-xs text-primary mt-1">Click point to view document</p>
        </div>
      );
    }
    return null;
  };

  const handlePointClick = (pointData: any, testName: string) => {
    const medical_test_id = pointData.test_id || pointData.medical_test_id;
    const fileName = pointData.file_name || pointData.fileName || "Medical_Document.pdf";

    if (medical_test_id) {
      router.push(`/tests/${medical_test_id}?name=${encodeURIComponent(fileName)}&highlight=${encodeURIComponent(testName)}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Medical Analytics</h1>
        <p className="text-muted-foreground mt-1">Track the evolution of your medical tests over time</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-muted-foreground">Loading your analytics...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && data.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h3 className="font-semibold text-foreground mb-2">No analytics data available</h3>
          <p className="text-muted-foreground text-sm">Upload medical tests with numerical values to see your health trends</p>
        </div>
      )}

      {/* Charts Grid */}
      {!loading && !error && data.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.map((item, idx) => {
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

            // Determine if latest value is in range
            const latestValue = values[values.length - 1];
            const inRange = item.min_reference !== null && item.max_reference !== null
              ? latestValue >= item.min_reference && latestValue <= item.max_reference
              : true;

            return (
              <div key={idx} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                {/* Chart Header */}
                <div className="p-5 border-b border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-semibold text-foreground">{item.test_name}</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Unit: {item.um || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Reference Range</div>
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-medium ${inRange ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'}`}>
                        {item.min_reference !== null ? item.min_reference : "Min"} - {item.max_reference !== null ? item.max_reference : "Max"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="p-5">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={item.measurements.map(m => ({ ...m, um: item.um }))}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="collection_date"
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                          tickMargin={10}
                        />
                        <YAxis
                          domain={[yAxisMin, yAxisMax]}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                          width={45}
                          tickFormatter={(value) => parseFloat(value.toFixed(2)).toString()}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        {/* Reference Area */}
                        {item.min_reference !== null && item.max_reference !== null && (
                          <ReferenceArea y1={item.min_reference} y2={item.max_reference} fill="#10b981" fillOpacity={0.1} />
                        )}
                        {item.min_reference === null && item.max_reference !== null && (
                          <ReferenceArea y2={item.max_reference} fill="#10b981" fillOpacity={0.1} />
                        )}
                        {item.min_reference !== null && item.max_reference === null && (
                          <ReferenceArea y1={item.min_reference} fill="#10b981" fillOpacity={0.1} />
                        )}

                        <Line
                          type="monotone"
                          dataKey="numeric_value"
                          stroke="#4896bb"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: '#4896bb', strokeWidth: 2, stroke: '#ffffff' }}
                          activeDot={(props: any) => {
                            const { cx, cy, payload } = props;
                            return (
                              <circle
                                cx={cx} cy={cy} r={7}
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
                          animationDuration={1500}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Chart Footer */}
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-muted-foreground">Your values</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-success/30" />
                        <span className="text-muted-foreground">Normal range</span>
                      </div>
                    </div>
                    <span className="text-muted-foreground">{item.measurements.length} measurements</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
