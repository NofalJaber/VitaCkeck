"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { testsApi } from "@/lib/axios";

export default function ViewTestPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const id = params.id as string;
    const fileName = searchParams.get("name") || "Medical_Document.pdf";

    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPdf = async () => {
            try {
                const response = await testsApi.get(`/${id}/download`, {
                    responseType: "blob",
                });

                // Create an Object URL for the iframe to consume
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
        }

        // Cleanup memory when the user leaves the page
        return () => {
            if (pdfUrl) {
                window.URL.revokeObjectURL(pdfUrl);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    return (
        <div className="max-w-5xl mx-auto mt-6 p-4">

            {/* Top Navigation & Action Bar */}
            <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push("/tests")}
                        className="flex items-center text-gray-600 hover:text-[#23436aff] hover:bg-gray-100 px-3 py-2 rounded-md transition-all duration-200"
                    >
                        {/* Back Arrow SVG */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Tests
                    </button>

                    <div className="h-6 w-px bg-gray-300"></div> {/* Divider */}

                    <h1 className="text-xl font-bold text-[#23436aff] truncate max-w-md">
                        {fileName}
                    </h1>
                </div>

                <button
                    onClick={handleDownload}
                    disabled={!pdfUrl}
                    className="flex items-center text-sm px-4 py-2 bg-[#4896bb] text-white hover:bg-[#377a99] rounded-md font-medium transition disabled:bg-gray-300"
                >
                    {/* Download Icon SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                </button>

            </div>

            {/* PDF Viewer Container */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden" style={{ height: "calc(100vh - 180px)" }}>
                {loading && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-[#4896bb]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading Document...
                    </div>
                )}

                {error && (
                    <div className="flex items-center justify-center h-full text-red-500 font-medium">
                        {error}
                    </div>
                )}

                {/* The actual native PDF viewer */}
                {pdfUrl && !loading && (
                    <iframe
                        src={`${pdfUrl}#toolbar=0`} // #toolbar=0 hides the browser's default top bar in the iframe
                        className="w-full h-full border-none"
                        title={fileName}
                    />
                )}
            </div>

        </div>
    );
}