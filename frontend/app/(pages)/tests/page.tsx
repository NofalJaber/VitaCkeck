"use client";

import { useState, useEffect, useRef } from "react";
import { testsApi } from "@/lib/axios";
import { useRouter } from "next/navigation";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (fileInputRef.current) fileInputRef.current.value = "";
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
    } catch (error) {
      console.error(`Failed to delete file`, error);
      setMessage("Failed to delete the test.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Medical Tests</h1>
        <p className="text-muted-foreground mt-1">Upload, view, and manage your medical test records</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6 sticky top-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Upload New Test</h2>
                <p className="text-sm text-muted-foreground">PDF files only</p>
              </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div 
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file ? (
                  <div>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4z" />
                      </svg>
                    </div>
                    <p className="font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="font-medium text-foreground">Click to select file</p>
                    <p className="text-sm text-muted-foreground mt-1">or drag and drop</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !file}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                  loading || !file
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload PDF
                  </>
                )}
              </button>
            </form>

            {message && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                message.includes("success")
                  ? "bg-success/10 text-success border border-success/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Tests List */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Your Records</h2>
              <span className="text-sm text-muted-foreground">{tests.length} test{tests.length !== 1 ? 's' : ''}</span>
            </div>

            {fetching ? (
              <div className="p-12 text-center">
                <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-muted-foreground">Loading your tests...</p>
              </div>
            ) : tests.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2">No tests uploaded yet</h3>
                <p className="text-muted-foreground text-sm">Upload your first medical test to get started</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {tests.map((test) => (
                  <li key={test.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-destructive" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{test.fileName}</p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded on {new Date(test.uploadDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleView(test.id, test.fileName)}
                          className="p-2 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                          title="View"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDownload(test.id, test.fileName, test.fileType)}
                          className="p-2 rounded-lg text-muted-foreground bg-muted hover:bg-muted/70 transition-colors"
                          title="Download"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(test.id)}
                          className="p-2 rounded-lg text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
