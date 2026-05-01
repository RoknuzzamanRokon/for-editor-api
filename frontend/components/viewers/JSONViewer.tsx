"use client";

import { useState, useCallback } from "react";

export default function JSONViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const onFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && (selectedFile.type === "application/json" || selectedFile.name.endsWith(".json"))) {
      setFile(selectedFile);
      setError("");
      setLoading(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parsed = JSON.parse(text);
          setJsonData(parsed);
          setLoading(false);
        } catch (err) {
          setError("Invalid JSON format");
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setError("Failed to read JSON file");
        setLoading(false);
      };

      reader.readAsText(selectedFile);
    } else {
      setError("Please select a valid JSON file (.json)");
    }
  }, []);

  const handleClose = () => {
    setFile(null);
    setJsonData(null);
    setError("");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Upload Section */}
      {!file && (
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <span className="material-symbols-outlined text-5xl text-primary">
                upload_file
              </span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
              Upload JSON File
            </h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Select a .json file to view
            </p>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-slate-900 transition-all hover:bg-primary/90">
              <span className="material-symbols-outlined">folder_open</span>
              Choose File
              <input
                type="file"
                accept=".json,application/json"
                onChange={onFileChange}
                className="hidden"
              />
            </label>
            {error && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
        </div>
      )}

      {/* JSON Viewer */}
      {file && (
        <>
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <span className="material-symbols-outlined text-lg">close</span>
                Close
              </button>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {file.name}
              </span>
            </div>
          </div>

          {/* JSON Display */}
          <div className="flex-1 overflow-auto bg-slate-100 p-4 dark:bg-slate-950">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Loading JSON...</p>
                </div>
              </div>
            ) : jsonData ? (
              <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-lg">
                <pre className="overflow-auto font-mono text-sm text-black">
                  {JSON.stringify(jsonData, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
