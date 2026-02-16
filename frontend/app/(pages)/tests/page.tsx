"use client";

import { useState, useEffect } from "react";
import { testsApi } from "@/lib/axios";
import { useRouter } from "next/navigation"; // <-- IMPORT THIS

interface MedicalTest {
    id: number;
    fileName: string;
    fileType: string;
    uploadDate: string;
}

export default function TestsPage() {
    const [tests, setTests] = useState<MedicalTest[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState("");
    const router = useRouter();

    const fetchTests = async () => {
        try {
            setFetching(true);
            const response = await testsApi.get("");
            setTests(response.data);
        } catch (error) {
            console.error("Failed to fetch tests", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setMessage("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            await testsApi.post("/upload", formData);
            setMessage("Test uploaded successfully!");
            setFile(null);

            const fileInput = document.getElementById("file-upload") as HTMLInputElement;
            if (fileInput) fileInput.value = "";

            fetchTests();
        } catch (error: any) {
            setMessage(error.response?.data || "An error occurred during upload.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id: number, fileName: string, fileType: string) => {
        try {
            const response = await testsApi.get(`/${id}/download`, {
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: fileType });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(`Failed to download file`, error);
        }
    };

    const handleView = (id: number, fileName: string) => {
        router.push(`/tests/${id}?name=${encodeURIComponent(fileName)}`);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this test?")) return;

        setLoading(true);
        setMessage("");

        try {
            await testsApi.delete(`/${id}/delete`);

            setTests(tests.filter((test) => test.id !== id));

            setMessage("Test deleted successfully.");
        }
        catch (error) {
            console.error(`Failed to delete file`, error);
            setMessage("Failed to delete the test.");
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6">
            <h1 className="text-3xl font-bold mb-8 text-[#23436aff]">My Medical Tests</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Upload Section */}
                <div className="col-span-1 bg-white p-6 shadow-md rounded-lg h-fit">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload New Test</h2>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <input
                                id="file-upload"
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#4896bb] file:text-white hover:file:bg-[#377a99] cursor-pointer"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !file}
                            className={`w-full py-2 px-4 rounded-md text-white font-medium ${loading || !file ? "bg-gray-300" : "bg-[#23436aff] hover:bg-blue-800"
                                } transition-colors`}
                        >
                            {loading ? "Uploading..." : "Upload PDF"}
                        </button>
                    </form>
                    {message && (
                        <div className={`mt-4 p-3 rounded text-sm ${message.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {message}
                        </div>
                    )}
                </div>

                {/* List Section */}
                <div className="col-span-1 md:col-span-2 bg-white p-6 shadow-md rounded-lg">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Past Records</h2>

                    {fetching ? (
                        <p className="text-gray-500">Loading your tests...</p>
                    ) : tests.length === 0 ? (
                        <p className="text-gray-500 italic">No medical tests uploaded yet.</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {tests.map((test) => (
                                <li key={test.id} className="py-4 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-800">{test.fileName}</span>
                                        <span className="text-xs text-gray-500">
                                            Uploaded on: {new Date(test.uploadDate).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleView(test.id, test.fileName)}
                                            className="text-sm px-4 py-2 bg-blue-50 text-[#23436aff] border border-[#23436aff] hover:bg-blue-100 rounded-md font-medium transition"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleDownload(test.id, test.fileName, test.fileType)}
                                            className="text-sm px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md font-medium transition"
                                        >
                                            Download
                                        </button>
                                        <button
                                            onClick={() => handleDelete(test.id)}
                                            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>

                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </div>
    );
}