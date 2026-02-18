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
    <div className="space-y-8">
      {/* Upload Section */}
      <section>
        <h2 className="text-sm font-medium uppercase tracking-wider text-black mb-4">
          Upload File
        </h2>

        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="flex-1 text-sm p-3 bg-white border border-black text-black cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:border file:border-black file:bg-white file:text-black file:text-xs file:uppercase file:tracking-wider hover:bg-gray-50 transition-colors"
            />
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="px-6 py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 border border-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Converting..." : "Convert"}
            </button>
          </div>

          {loading && (
            <div className="border border-black p-6 text-center bg-white">
              <div className="inline-block w-8 h-8 border-2 border-gray-300 border-t-black animate-spin mb-3" />
              <p className="text-xs text-black uppercase tracking-wider">
                Processing...
              </p>
            </div>
          )}

          {message && (
            <div className="border border-black p-4 bg-white">
              <p className="text-xs text-black">
                {message.type === "success" ? "✓ " : "✕ "}
                {message.text}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Files Section */}
      <section>
        <h2 className="text-sm font-medium uppercase tracking-wider text-black mb-4">
          Converted Files
        </h2>

        {files.length === 0 ? (
          <div className="border border-dashed border-black p-12 text-center bg-white">
            <p className="text-xs text-black uppercase tracking-wider">
              No files available
            </p>
          </div>
        ) : (
          <div className="border border-black overflow-hidden bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-black text-white">
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider">
                    Filename
                  </th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider">
                    Date
                  </th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider">
                    Size
                  </th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {files.map((f, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-black hover:bg-gray-100 transition-colors"
                  >
                    <td className="p-3 text-xs font-mono text-black">
                      {f.filename}
                    </td>
                    <td className="p-3 text-xs text-black">
                      {formatDate(f.conversion_date)}
                    </td>
                    <td className="p-3 text-xs text-black">
                      {formatSize(f.file_size)}
                    </td>
                    <td className="p-3">
                      <a
                        href={`/api/v1/conversions/pdf-to-excel/files/${f.filename}`}
                        download
                        className="inline-block px-4 py-1.5 bg-white text-black border border-black text-xs font-medium uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                      >
                        Download
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
