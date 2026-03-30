"use client";

import { useEffect, useState, Suspense } from "react";
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

const RangeIndicator = ({ value, min, max, textReference, limits }: { value: number | null, min: number | null, max: number | null, textReference: string | null, limits: Limit[] | null }) => {
    if (value === null) {
        return <span className="text-muted-foreground text-[11px] italic">N/A graphic</span>;
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
            return <span className="text-muted-foreground text-[11px] italic">No reference</span>;
        }
    }

    if (ranges.length > 0 && ranges[0].status === 'LOW' && ranges[0].upperBound === 0) {
        ranges.shift();
    }

    let thresholds: number[] = [];
    for (let i = 0; i < ranges.length - 1; i++) {
        const boundary = ranges[i].upperBound !== null ? ranges[i].upperBound : ranges[i + 1].lowerBound;
        if (boundary !== null) {
            thresholds.push(boundary);
        }
    }

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

    const totalHighs = ranges.filter(r => r.status === 'HIGH').length;
    const highPalette = ['bg-orange-200', 'bg-red-200', 'bg-red-300'];
    const startHighIndex = Math.max(0, highPalette.length - totalHighs);

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

    let percent = 0;
    let activeSegment = 0;

    if (value < points[0]) {
        percent = 2; 
        activeSegment = 0;
    } else if (value > points[points.length - 1]) {
        percent = 98; 
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
    const dotColorClass = activeBgClass ? dotColorMap[activeBgClass] : 'bg-muted-foreground';

    return (
        <div className="relative w-full min-w-[150px] max-w-60 h-12 flex flex-col justify-center mx-auto">
            <div className="flex w-full h-1.5 rounded-full overflow-hidden bg-muted">
                {segmentColors.map((color, idx) => (
                    <div
                        key={idx}
                        className={`h-full ${color}`}
                        style={{ width: `${segmentWidth}%`, borderRight: idx < numSegments - 1 ? '1.5px solid var(--card)' : 'none' }}
                    ></div>
                ))}
            </div>

            {thresholds.map((t, idx) => (
                <div
                    key={idx}
                    className="absolute top-7 text-[10px] font-semibold text-muted-foreground -translate-x-1/2 mt-0.5 whitespace-nowrap"
                    style={{ left: `${(idx + 1) * segmentWidth}%` }}
                >
                    {t}
                </div>
            ))}

            <div
                className={`absolute w-3.5 h-3.5 rounded-full border-2 border-card shadow-md ${dotColorClass} top-1/2 -translate-y-[150%] -ml-[7px] transition-transform duration-700 ease-out z-10`}
                style={{ left: `${percent}%` }}
            ></div>
        </div>
    );
};

function ViewTestContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const id = params.id as string;
    const fileName = searchParams.get("name") || "Medical_Document.pdf";
    const highlightParam = searchParams.get("highlight");

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

    useEffect(() => {
        if (!fetching && data && highlightParam) {
            const element = document.getElementById(`row-${highlightParam}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [fetching, data, highlightParam]);

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
        <div className="max-w-6xl mx-auto mt-4 md:mt-6 p-3 md:p-4">
            
            {/* Responsive Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 bg-card p-4 rounded-lg shadow-sm border border-border">
                <div className="flex items-center gap-3 w-full md:w-auto overflow-hidden">
                    <button
                        onClick={() => router.push("/tests")}
                        className="flex-shrink-0 flex items-center text-muted-foreground hover:text-foreground hover:bg-muted px-2 md:px-3 py-2 rounded-md"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="hidden sm:inline">Back</span>
                    </button>
                    <div className="h-6 w-px bg-border flex-shrink-0"></div>
                    <h1 className="text-lg md:text-xl font-bold text-foreground truncate flex-1" title={fileName}>
                        {fileName}
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                    <button
                        onClick={handleAnalyze}
                        disabled={!pdfUrl || isAnalyzing}
                        className="w-full sm:w-auto flex items-center justify-center min-w-[110px] text-sm px-4 py-2.5 bg-[#1eb176] text-white hover:bg-[#0d744b] rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="w-full sm:w-auto flex justify-center items-center text-sm px-4 py-2.5 bg-[#4896bb] text-white hover:bg-[#377a99] rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                    </button>
                </div>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-md text-sm font-medium ${message.includes("successfully") ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                    {message}
                </div>
            )}

            <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden mb-6" style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}>
                {loading && (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading Document...
                    </div>
                )}
                {error && <div className="flex items-center justify-center h-full text-destructive font-medium">{error}</div>}
                {pdfUrl && !loading && (
                    <iframe src={`${pdfUrl}#toolbar=0`} className="w-full h-full border-none" title={fileName} />
                )}
            </div>

            {/* EXTRACTED DATA SECTION */}
            {!fetching && data && data.rezults && data.rezults.length > 0 && (
                <div className="bg-card rounded-xl shadow-md border border-border p-4 md:p-6 mb-8 overflow-hidden">
                    <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Extracted Medical Data
                    </h2>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6 pb-4 md:pb-6 border-b border-border bg-muted/30 p-4 rounded-lg">
                        <div>
                            <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Laboratory</span>
                            <span className="font-semibold text-foreground">{data.laboratory || "N/A"}</span>
                        </div>

                        <div className="sm:text-right">
                            <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Collection Date</span>
                            <span className="font-semibold text-foreground">{data.collection_date || "N/A"}</span>
                        </div>
                    </div>

                    <div className="w-full">
                        <table className="block md:table w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
                            <thead className="hidden md:table-header-group border-b border-border text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Test Name</th>
                                    <th className="px-4 py-3 font-medium">Result</th>
                                    <th className="px-4 py-3 font-medium text-center w-64">Indicator Graphic</th>
                                    <th className="px-4 py-3 font-medium">Reference Range</th>
                                    <th className="px-4 py-3 font-medium text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="block md:table-row-group divide-y-0 md:divide-y md:divide-border/50">
                                {data.rezults.map((item, idx) => {
                                    const refRange = item.text_reference
                                        ? item.text_reference
                                        : (item.min_reference !== null && item.max_reference !== null)
                                            ? `${item.min_reference} - ${item.max_reference}`
                                            : "-";

                                    let badgeColorClass = "bg-muted text-foreground";
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
                                            badgeColorClass = "bg-blue-500/10 text-blue-500";
                                        } else if (matchedStatus === 'HIGH') {
                                            badgeColorClass = "bg-destructive/10 text-destructive";
                                        } else if (matchedStatus === 'INCONCLUSIVE') {
                                            badgeColorClass = "bg-yellow-500/10 text-yellow-500";
                                        } else {
                                            badgeColorClass = "bg-success/10 text-success";
                                            if (!item.flag) badgeText = "Normal";
                                        }

                                    } else {
                                        if (item.flag && item.flag !== "NORMAL" && item.flag !== "Normal" && item.flag !== "Acceptabil") {
                                            if (item.flag.toUpperCase().includes('CRESCUT') || item.flag.toUpperCase() === 'HIGH') {
                                                badgeColorClass = "bg-destructive/10 text-destructive";
                                            } else if (item.flag.toLowerCase().includes('limita') || item.flag.toLowerCase().includes('inconclusive')) {
                                                badgeColorClass = "bg-yellow-500/10 text-yellow-500";
                                            } else {
                                                badgeColorClass = "bg-blue-500/10 text-blue-500";
                                            }
                                        } else {
                                            badgeColorClass = "bg-success/10 text-success";
                                            badgeText = item.flag || "Normal";
                                        }
                                    }

                                    return (
                                        <tr
                                            key={idx}
                                            id={`row-${item.test_name}`}
                                            className={`flex flex-col md:table-row border border-border md:border-transparent rounded-xl md:rounded-none mb-4 md:mb-0 p-4 md:p-0 shadow-sm md:shadow-none ${
                                                highlightParam === item.test_name ? "bg-accent/20" : "bg-card hover:bg-muted/50"
                                            }`}
                                        >
                                            {/* 1. Nume Test & Status Badge (pe mobil) */}
                                            <td className="order-1 flex justify-between items-start md:table-cell px-0 md:px-4 py-2 md:py-4 border-b border-border md:border-none mb-2 md:mb-0">
                                                <span className="font-bold text-foreground text-base md:text-sm whitespace-normal md:max-w-[200px] pr-2">
                                                    {item.test_name}
                                                </span>
                                                <span className={`md:hidden shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${badgeColorClass}`}>
                                                    {badgeText}
                                                </span>
                                            </td>

                                            {/* 2. Rezultat */}
                                            <td className="order-2 flex justify-between items-center md:table-cell px-0 md:px-4 py-2 md:py-4">
                                                <span className="md:hidden text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rezultat</span>
                                                <div className="text-right md:text-left">
                                                    <span className="font-bold text-foreground text-lg md:text-base">
                                                        {item.numeric_value !== null ? item.numeric_value : item.string_value || "-"}
                                                    </span>
                                                    <span className="text-muted-foreground ml-1 text-sm md:text-xs">{item.um || ""}</span>
                                                </div>
                                            </td>

                                            {/* 3. Grafic Indicator */}
                                            <td className="order-4 md:order-3 block md:table-cell px-0 md:px-4 py-3 md:py-4 w-full md:w-64 pt-4 md:pt-4">
                                                <span className="md:hidden text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-6 text-center">Grafic Indicator</span>
                                                <div className="w-full px-2 md:px-0">
                                                    <RangeIndicator
                                                        value={item.numeric_value}
                                                        min={item.min_reference}
                                                        max={item.max_reference}
                                                        textReference={item.text_reference}
                                                        limits={item.limits}
                                                    />
                                                </div>
                                            </td>

                                            {/* 4. Interval Referinta */}
                                            <td className="order-3 md:order-4 flex justify-between items-center md:table-cell px-0 md:px-4 py-2 md:py-4 border-b border-border md:border-none mb-2 md:mb-0">
                                                <span className="md:hidden text-xs font-semibold text-muted-foreground uppercase tracking-wider">Referință</span>
                                                <span className="text-foreground font-medium md:font-normal text-sm md:text-[11px] whitespace-normal max-w-[200px] text-right md:text-left leading-snug">
                                                    {refRange}
                                                </span>
                                            </td>

                                            {/* 5. Status Badge (Doar Desktop) */}
                                            <td className="order-5 hidden md:table-cell px-4 py-4 text-center">
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

export default function ViewTestPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen text-muted-foreground">
                <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Se încarcă detaliile testului...
            </div>
        }>
            <ViewTestContent />
        </Suspense>
    );
}