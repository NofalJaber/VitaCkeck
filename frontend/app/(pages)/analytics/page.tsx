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

// Interfețele bazate pe DTO-ul din backend
interface Measurement {
    collection_date: string;
    numeric_value: number;
    string_value?: string;
}

interface AnalyticsData {
    test_name: string;
    um: string;
    min_reference: number | null;
    max_reference: number | null;
    measurements: Measurement[];
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Asigură-te că acest URL se potrivește cu controller-ul tău din Spring Boot
                const response = await testsApi.get("/analytics");

                // Opțional: Putem filtra testele care au o singură măsurătoare dacă vrei grafice doar pentru istoric (evoluție)
                // const filteredData = response.data.filter((d: AnalyticsData) => d.measurements.length > 1);

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

    // Funcție pentru customizarea Tooltip-ului când faci hover pe un punct
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
                    <p className="text-gray-500 text-sm mb-1">{label}</p>
                    <p className="font-bold text-[#23436aff]">
                        Value: {payload[0].value} {payload[0].payload.um}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="max-w-7xl mx-auto mt-6 p-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#23436aff]">Medical Analytics</h1>
                <p className="text-gray-500 mt-2">Track the evolution of your medical tests over time.</p>
            </div>

            {loading && (
                <div className="flex items-center justify-center h-64 text-gray-500">
                    <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-[#4896bb]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading charts...
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg font-medium">
                    {error}
                </div>
            )}

            {!loading && !error && data.length === 0 && (
                <div className="bg-white p-8 text-center rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-500">Not enough numerical data to generate charts.</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {!loading && data.map((item, idx) => {
                    // --- PRE-CALCULARE PENTRU AXA Y ---
                    // 1. Extragem minimul și maximul real din măsurătorile pacientului
                    const values = item.measurements.map(m => m.numeric_value);
                    const actualDataMin = values.length > 0 ? Math.min(...values) : 0;
                    const actualDataMax = values.length > 0 ? Math.max(...values) : 10;

                    // 2. Setăm referințele (dacă lipsesc, folosim datele pacientului)
                    const minLimit = item.min_reference !== null ? item.min_reference : actualDataMin;
                    const maxLimit = item.max_reference !== null ? item.max_reference : actualDataMax;

                    // 3. Calculăm padding-ul (50% din intervalul de referință)
                    let padding = 0;
                    if (item.min_reference !== null && item.max_reference !== null) {
                        padding = (item.max_reference - item.min_reference) * 0.5;
                    } else {
                        padding = (maxLimit - minLimit) * 0.2;
                        if (padding === 0) padding = maxLimit * 0.2; // Fallback
                    }

                    // 4. Calculăm baza graficului, împiedicând-o să scadă sub 0 dacă referința minimă e >= 0
                    let calculatedBottom = minLimit - padding;
                    if (minLimit === 0 || (calculatedBottom < 0 && minLimit >= 0)) {
                        calculatedBottom = 0;
                    }

                    // 5. Ajustăm marginile finale ca să încapă și punctele extreme ale pacientului
                    const finalBottom = Math.min(actualDataMin, calculatedBottom);
                    const finalTop = Math.max(actualDataMax, maxLimit + padding);

                    const yAxisMin = finalBottom === 0 ? 0 : finalBottom - Math.abs(finalBottom * 0.05);
                    const yAxisMax = finalTop + Math.abs(finalTop * 0.05);
                    // ----------------------------------

                    return (
                        <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-shadow hover:shadow-md">

                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">{item.test_name}</h2>
                                    <p className="text-sm text-gray-500 flex items-center mt-1">
                                        <span className="font-medium mr-2">Unit:</span> {item.um || "N/A"}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs uppercase tracking-wider text-gray-400 block mb-1">Reference</span>
                                    <span className="text-sm font-semibold text-gray-600">
                                        {item.min_reference !== null ? item.min_reference : "Min"} - {item.max_reference !== null ? item.max_reference : "Max"}
                                    </span>
                                </div>
                            </div>

                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={item.measurements.map(m => ({ ...m, um: item.um }))}
                                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis
                                            dataKey="collection_date"
                                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickMargin={10}
                                        />
                                        <YAxis
                                            domain={[yAxisMin, yAxisMax]}
                                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                                            axisLine={false}
                                            tickLine={false}
                                            width={45}
                                            tickFormatter={(value) => {
                                                // Rotunjim la max 2 zecimale și transformăm explicit rezultatul în string
                                                return parseFloat(value.toFixed(2)).toString();
                                            }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />

                                        {/* Zona Verde */}
                                        {item.min_reference !== null && item.max_reference !== null && (
                                            <ReferenceArea
                                                y1={item.min_reference}
                                                y2={item.max_reference}
                                                fill="#bbf7d0"
                                                fillOpacity={0.3}
                                            />
                                        )}
                                        {item.min_reference === null && item.max_reference !== null && (
                                            <ReferenceArea y2={item.max_reference} fill="#bbf7d0" fillOpacity={0.3} />
                                        )}
                                        {item.min_reference !== null && item.max_reference === null && (
                                            <ReferenceArea y1={item.min_reference} fill="#bbf7d0" fillOpacity={0.3} />
                                        )}

                                        <Line
                                            type="monotone"
                                            dataKey="numeric_value"
                                            stroke="#4896bb"
                                            strokeWidth={3}
                                            dot={{ r: 5, fill: '#4896bb', strokeWidth: 2, stroke: '#ffffff' }}
                                            activeDot={{ r: 7, fill: '#1eb176', strokeWidth: 0 }}
                                            animationDuration={1500}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}