"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { testsApi } from "@/lib/axios";

interface Limit {
    status: string;
    label: string;
    lowerBound: number | null;
    upperBound: number | null;
}

interface TestData {
    test_name: string;
    numeric_value: number | null;
    string_value: string | null;
    um: string | null;
    min_reference: number | null;
    max_reference: number | null;
    text_reference: string | null;
    flag: string | null;
    limits: Limit[] | null;
}

interface MedicalTestItems {
    laboratory: string | null;
    collection_date: string | null;
    rezults: TestData[];
}

// --- HELPER COMPONENT: Range Indicator Graphic ---
const RangeIndicator = ({ value, min, max, textReference, limits }: { value: number | null, min: number | null, max: number | null, textReference: string | null, limits: Limit[] | null }) => {
    if (value === null) {
        return <span className="text-gray-400 text-[11px] italic">N/A graphic</span>;
    }

    let ranges: Limit[] = [];

    if (limits && Array.isArray(limits) && limits.length > 0) {
        ranges = [...limits];
    } else {
        if (min !== null && max !== null) {
            ranges = [
                { status: 'LOW', lowerBound: null, upperBound: min, label: 'Scazut' },
                { status: 'NORMAL', lowerBound: min, upperBound: max, label: 'Normal' },
                { status: 'HIGH', lowerBound: max, upperBound: null, label: 'Crescut' }
            ];
        } else if (max !== null) {
            ranges = [
                { status: 'NORMAL', lowerBound: null, upperBound: max, label: 'Normal' },
                { status: 'HIGH', lowerBound: max, upperBound: null, label: 'Crescut' }
            ];
        } else if (min !== null) {
            ranges = [
                { status: 'LOW', lowerBound: null, upperBound: min, label: 'Scazut' },
                { status: 'NORMAL', lowerBound: min, upperBound: null, label: 'Normal' }
            ];
        } else {
            return <span className="text-gray-400 text-[11px] italic">No reference</span>;
        }
    }

    if (ranges.length > 0 && ranges[0].status === 'LOW' && ranges[0].upperBound === 0) {
        ranges.shift();
    }

    // Extract numerical thresholds that divide the segments
    let thresholds: number[] = [];
    for (let i = 0; i < ranges.length - 1; i++) {
        const boundary = ranges[i].upperBound !== null ? ranges[i].upperBound : ranges[i + 1].lowerBound;
        if (boundary !== null) {
            thresholds.push(boundary);
        }
    }

    // 4. Build absolute bounds of the bar (minBound and maxBound)
    let minBound = 0;
    if (thresholds.length > 0) {
        minBound = thresholds[0] > 0 ? 0 : thresholds[0] - Math.abs(thresholds[0] * 0.5);
    }
    if (value < minBound) minBound = value < 0 ? value * 1.2 : 0;

    let maxBound = 10;
    if (thresholds.length > 0) {
        maxBound = thresholds[thresholds.length - 1] * 1.3;
    }
    if (maxBound === 0) maxBound = 10;
    if (value > maxBound) maxBound = value + Math.abs(value * 0.2);

    const points = [minBound, ...thresholds, maxBound];
    const numSegments = ranges.length;
    const segmentWidth = 100 / numSegments;

    // Dynamic Color calculation for HIGH states
    const totalHighs = ranges.filter(r => r.status === 'HIGH').length;
    const highPalette = ['bg-orange-200', 'bg-red-200', 'bg-red-300'];
    const startHighIndex = Math.max(0, highPalette.length - totalHighs);

    // Dynamic color assignment based EXACTLY on received `status`
    let segmentColors: string[] = [];
    let highCounter = 0;
    let lowCounter = 0;

    for (let i = 0; i < numSegments; i++) {
        const status = ranges[i]?.status || 'NORMAL';

        if (status === 'LOW') {
            segmentColors.push(lowCounter === 0 ? 'bg-blue-300' : 'bg-blue-200');
            lowCounter++;
        } else if (status === 'HIGH') {
            const colorIndex = Math.min(highPalette.length - 1, startHighIndex + highCounter);
            segmentColors.push(highPalette[colorIndex]);
            highCounter++;
        } else if (status === 'INCONCLUSIVE') {
            segmentColors.push('bg-yellow-200');
        } else {
            segmentColors.push('bg-green-200');
        }
    }

    // Calculate the exact percentage where the patient's dot will sit
    let percent = 0;
    let activeSegment = 0;

    if (value < points[0]) {
        percent = 2; // Min visible
        activeSegment = 0;
    } else if (value > points[points.length - 1]) {
        percent = 98; // Max visible
        activeSegment = numSegments - 1;
    } else {
        for (let i = 0; i < numSegments; i++) {
            if (value >= points[i] && value <= points[i + 1]) {
                const rangeDiff = points[i + 1] - points[i];
                const localPercent = rangeDiff === 0 ? 0.5 : (value - points[i]) / rangeDiff;
                percent = (i * segmentWidth) + (localPercent * segmentWidth);
                activeSegment = i;
                break;
            }
        }
    }

    // Explicit mapping to prevent Tailwind from purging classes
    const dotColorMap: Record<string, string> = {
        'bg-blue-200': 'bg-blue-500',
        'bg-blue-300': 'bg-blue-600',
        'bg-green-200': 'bg-green-500',
        'bg-yellow-200': 'bg-yellow-500',
        'bg-orange-200': 'bg-orange-500',
        'bg-red-200': 'bg-red-500',
        'bg-red-300': 'bg-red-600',
    };

    const activeBgClass = segmentColors[activeSegment];
    const dotColorClass = activeBgClass ? dotColorMap[activeBgClass] : 'bg-gray-500';

    return (
        <div className="relative w-full min-w-[150px] max-w-60 h-12 flex flex-col justify-center mx-auto">
            <div className="flex w-full h-1.5 rounded-full overflow-hidden bg-gray-100">
                {segmentColors.map((color, idx) => (
                    <div
                        key={idx}
                        className={`h-full ${color}`}
                        style={{ width: `${segmentWidth}%`, borderRight: idx < numSegments - 1 ? '1.5px solid white' : 'none' }}
                    ></div>
                ))}
            </div>

            {thresholds.map((t, idx) => (
                <div
                    key={idx}
                    className="absolute top-7 text-[10px] font-semibold text-gray-500 -translate-x-1/2 mt-0.5 whitespace-nowrap"
                    style={{ left: `${(idx + 1) * segmentWidth}%` }}
                >
                    {t}
                </div>
            ))}

            <div
                className={`absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-md ${dotColorClass} top-1/2 -translate-y-[150%] -ml-[7px] transition-all duration-700 ease-out z-10`}
                style={{ left: `${percent}%` }}
            ></div>
        </div>
    );
};

export default function ViewTestPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const id = params.id as string;
    const fileName = searchParams.get("name") || "Medical_Document.pdf";

    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [data, setData] = useState<MedicalTestItems | null>(null);
    const [fetching, setFetching] = useState(true);

    const fetchData = async () => {
        try {
            setFetching(true);
            const response = await testsApi.get(`/${id}/test-data`);
            setData(response.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        const fetchPdf = async () => {
            try {
                const response = await testsApi.get(`/${id}/download`, {
                    responseType: "blob",
                });
                const blob = new Blob([response.data], { type: "application/pdf" });
                const url = window.URL.createObjectURL(blob);
                setPdfUrl(url);
            } catch (err) {
                console.error("Failed to load PDF", err);
                setError("Failed to load the document.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPdf();
            fetchData();
        }

        return () => {
            if (pdfUrl) {
                window.URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [id]);

    const handleDownload = () => {
        if (!pdfUrl) return;
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAnalyzing(true);
        setMessage("");

        try {
            await testsApi.post(`/${id}/analyze`);
            setMessage("Test analyzed successfully!");
            await fetchData();
        } catch (error: any) {
            setMessage(error.response?.data || "An error occurred");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-6 p-4">
            <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push("/tests")}
                        className="flex items-center text-gray-600 hover:text-[#23436aff] hover:bg-gray-100 px-3 py-2 rounded-md transition-all duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Tests
                    </button>
                    <div className="h-6 w-px bg-gray-300"></div>
                    <h1 className="text-xl font-bold text-[#23436aff] truncate max-w-md">
                        {fileName}
                    </h1>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleAnalyze}
                        disabled={!pdfUrl || isAnalyzing}
                        className="flex items-center justify-center min-w-[110px] text-sm px-4 py-2 bg-[#1eb176] text-white hover:bg-[#0d744b] rounded-md font-medium transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isAnalyzing ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                            </>
                        ) : (
                            "Analyze"
                        )}
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={!pdfUrl}
                        className="flex items-center text-sm px-4 py-2 bg-[#4896bb] text-white hover:bg-[#377a99] rounded-md font-medium transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                    </button>
                </div>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-md text-sm font-medium ${message.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {message}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-6" style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}>
                {loading && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-[#4896bb]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading Document...
                    </div>
                )}
                {error && <div className="flex items-center justify-center h-full text-red-500 font-medium">{error}</div>}
                {pdfUrl && !loading && (
                    <iframe src={`${pdfUrl}#toolbar=0`} className="w-full h-full border-none" title={fileName} />
                )}
            </div>

            {/* EXTRACTED DATA SECTION */}
            {!fetching && data && data.rezults && data.rezults.length > 0 && (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8 overflow-hidden">
                    <h2 className="text-xl font-bold text-[#23436aff] mb-6 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#4896bb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Extracted Medical Data
                    </h2>

                    <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100 bg-gray-50 p-4 rounded-lg">
                        <div>
                            <span className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Laboratory</span>
                            <span className="font-semibold text-gray-800">{data.laboratory || "N/A"}</span>
                        </div>

                        <div className="text-right">
                            <span className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Collection Date</span>
                            <span className="font-semibold text-gray-800">{data.collection_date || "N/A"}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm whitespace-nowrap">
                            <thead className="border-b border-gray-200 text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Test Name</th>
                                    <th className="px-4 py-3 font-medium">Result</th>
                                    <th className="px-4 py-3 font-medium text-center w-64">Indicator Graphic</th>
                                    <th className="px-4 py-3 font-medium">Reference Range</th>
                                    <th className="px-4 py-3 font-medium text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.rezults.map((item, idx) => {
                                    const refRange = item.text_reference
                                        ? item.text_reference
                                        : (item.min_reference !== null && item.max_reference !== null)
                                            ? `${item.min_reference} - ${item.max_reference}`
                                            : "-";

                                    let badgeColorClass = "bg-gray-100 text-gray-700";
                                    let badgeText = item.flag || "Unknown";

                                    if (item.numeric_value !== null) {
                                        let ranges: Limit[] = [];
                                        
                                        if (item.limits && Array.isArray(item.limits) && item.limits.length > 0) {
                                            ranges = [...item.limits];
                                        }
                                        else {
                                            if (item.min_reference !== null && item.max_reference !== null) {
                                                ranges = [
                                                    { status: 'LOW', lowerBound: null, upperBound: item.min_reference, label: 'Scazut' },
                                                    { status: 'NORMAL', lowerBound: item.min_reference, upperBound: item.max_reference, label: 'Normal' },
                                                    { status: 'HIGH', lowerBound: item.max_reference, upperBound: null, label: 'Crescut' }
                                                ];
                                            } else if (item.max_reference !== null) {
                                                ranges = [
                                                    { status: 'NORMAL', lowerBound: null, upperBound: item.max_reference, label: 'Normal' },
                                                    { status: 'HIGH', lowerBound: item.max_reference, upperBound: null, label: 'Crescut' }
                                                ];
                                            } else if (item.min_reference !== null) {
                                                ranges = [
                                                    { status: 'LOW', lowerBound: null, upperBound: item.min_reference, label: 'Scazut' },
                                                    { status: 'NORMAL', lowerBound: item.min_reference, upperBound: null, label: 'Normal' }
                                                ];
                                            }
                                        }

                                        if (ranges.length > 0 && ranges[0].status === 'LOW' && ranges[0].upperBound === 0) {
                                            ranges.shift();
                                        }

                                        let matchedStatus = 'NORMAL';

                                        if (ranges.length > 0 && item.numeric_value !== null) {
                                            if (ranges[0].upperBound !== null && item.numeric_value < (ranges[0].upperBound ?? 0)) {
                                                matchedStatus = ranges[0].status;
                                            } else if (ranges[ranges.length - 1].lowerBound !== null && item.numeric_value > (ranges[ranges.length - 1].lowerBound ?? 0)) {
                                                matchedStatus = ranges[ranges.length - 1].status || 'HIGH';
                                            } else {
                                                for (const r of ranges) {
                                                    if (r.lowerBound !== null && r.upperBound !== null &&
                                                        item.numeric_value >= r.lowerBound && item.numeric_value <= r.upperBound) {
                                                        matchedStatus = r.status;
                                                        break;
                                                    }
                                                }
                                            }
                                        }

                                        if (matchedStatus === 'LOW') {
                                            badgeColorClass = "bg-blue-100 text-blue-700";
                                        } else if (matchedStatus === 'HIGH') {
                                            badgeColorClass = "bg-red-100 text-red-700";
                                        } else if (matchedStatus === 'INCONCLUSIVE') {
                                            badgeColorClass = "bg-yellow-100 text-yellow-700";
                                        } else {
                                            badgeColorClass = "bg-green-100 text-green-700";
                                            if (!item.flag) badgeText = "Normal";
                                        }

                                    } else {
                                        if (item.flag && item.flag !== "NORMAL" && item.flag !== "Normal" && item.flag !== "Acceptabil") {
                                            if (item.flag.toUpperCase().includes('CRESCUT') || item.flag.toUpperCase() === 'HIGH') {
                                                badgeColorClass = "bg-red-100 text-red-700";
                                            } else if (item.flag.toLowerCase().includes('limita') || item.flag.toLowerCase().includes('inconclusive')) {
                                                badgeColorClass = "bg-yellow-100 text-yellow-700";
                                            } else {
                                                badgeColorClass = "bg-blue-100 text-blue-700";
                                            }
                                        } else {
                                            badgeColorClass = "bg-green-100 text-green-700";
                                            badgeText = item.flag || "Normal";
                                        }
                                    }

                                    return (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-4 font-medium text-gray-800 whitespace-normal max-w-[150px]">{item.test_name}</td>

                                            <td className="px-4 py-4">
                                                <span className="font-bold text-gray-900 text-base">
                                                    {item.numeric_value !== null ? item.numeric_value : item.string_value || "-"}
                                                </span>
                                                <span className="text-gray-500 ml-1 text-xs">{item.um || ""}</span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <RangeIndicator
                                                    value={item.numeric_value}
                                                    min={item.min_reference}
                                                    max={item.max_reference}
                                                    textReference={item.text_reference}
                                                    limits={item.limits}
                                                />
                                            </td>

                                            <td className="px-4 py-4 text-gray-500 text-[11px] whitespace-normal max-w-[200px] leading-snug">
                                                {refRange}
                                            </td>

                                            <td className="px-4 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeColorClass}`}>
                                                    {badgeText}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}