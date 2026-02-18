"use client";

import { useState, useEffect } from "react";

interface FileInfo {
  filename: string;
  conversion_date: string;
  file_size: number;
}

export default function ExcelConverter({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const res = await fetch("/api/v1/conversions/pdf-to-excel/files");
      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error("Error loading files:", error);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a file" });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setMessage({ type: "error", text: "File size exceeds 50MB limit" });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/v1/conversions/pdf-to-excel", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({ type: "success", text: data.message });
        setFile(null);
        onSuccess();
        await loadFiles();
      } else {
        setMessage({
          type: "error",
          text: data.detail || data.message || "Conversion failed",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      {/* Upload Section */}
      <section className="mb-12 bg-[rgba(30,30,35,0.6)] p-8 rounded-2xl border border-white/5">
        <h2 className="text-2xl font-semibold mb-6 text-white border-l-4 border-blue-500 pl-4">
          📤 Upload PDF
        </h2>
        <div className="flex gap-4 items-center flex-wrap">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="flex-1 min-w-[250px] p-4 bg-[rgba(20,20,25,0.8)] border-2 border-white/10 rounded-xl text-gray-300 cursor-pointer hover:border-blue-500 transition-all"
          />
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="px-10 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 hover:transform hover:-translate-y-0.5"
          >
            {loading ? "🔄 Converting..." : "🔄 Convert to Excel"}
          </button>
        </div>

        {loading && (
          <div className="mt-6 text-center p-8 bg-[rgba(30,30,35,0.8)] rounded-xl border border-white/5">
            <div className="w-12 h-12 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">
              Processing your PDF file and extracting data...
            </p>
          </div>
        )}

        {message && (
          <div
            className={`mt-6 p-5 rounded-xl border-l-4 ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500 text-green-400"
                : "bg-red-500/10 border-red-500 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}
      </section>

      {/* Files Section */}
      <section className="bg-[rgba(30,30,35,0.6)] p-8 rounded-2xl border border-white/5">
        <h2 className="text-2xl font-semibold mb-6 text-white border-l-4 border-green-500 pl-4">
          📥 Converted Files
        </h2>

        {files.length === 0 ? (
          <div className="text-center p-16 bg-[rgba(20,20,25,0.6)] rounded-xl border-2 border-dashed border-white/10">
            <div className="text-6xl mb-4 opacity-50">📂</div>
            <p className="text-gray-500 text-lg">
              No converted files available yet. Upload a PDF to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#1a1a1f] to-[#25252b]">
                <tr>
                  <th className="p-5 text-left font-semibold text-white border-b-2 border-white/10">
                    Filename
                  </th>
                  <th className="p-5 text-left font-semibold text-white border-b-2 border-white/10">
                    Date
                  </th>
                  <th className="p-5 text-left font-semibold text-white border-b-2 border-white/10">
                    Size
                  </th>
                  <th className="p-5 text-left font-semibold text-white border-b-2 border-white/10">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {files.map((f, idx) => (
                  <tr
                    key={idx}
                    className="bg-[rgba(25,25,30,0.7)] hover:bg-[rgba(40,40,45,0.9)] transition-all even:bg-[rgba(30,30,35,0.7)]"
                  >
                    <td className="p-5 border-b border-white/5 text-white font-medium">
                      📊 {f.filename}
                    </td>
                    <td className="p-5 border-b border-white/5 text-gray-400">
                      {formatDate(f.conversion_date)}
                    </td>
                    <td className="p-5 border-b border-white/5 text-gray-400">
                      {formatSize(f.file_size)}
                    </td>
                    <td className="p-5 border-b border-white/5">
                      <a
                        href={`/api/v1/conversions/pdf-to-excel/files/${f.filename}`}
                        download
                        className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/30"
                      >
                        ⬇️ Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
