"use client";

import { useState, useCallback } from "react";
import * as XLSX from "xlsx";

type SheetData = {
  name: string;
  data: string[][];
};

export default function ExcelViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheet, setActiveSheet] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const onFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (
      selectedFile &&
      (selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.name.endsWith(".xlsx") ||
        selectedFile.name.endsWith(".xls"))
    ) {
      setFile(selectedFile);
      setError("");
      setLoading(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });

          const parsedSheets: SheetData[] = workbook.SheetNames.map((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
            return {
              name: sheetName,
              data: jsonData,
            };
          });

          setSheets(parsedSheets);
          setActiveSheet(0);
          setLoading(false);
        } catch (err) {
          setError("Failed to parse Excel file");
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setError("Failed to read Excel file");
        setLoading(false);
      };

      reader.readAsBinaryString(selectedFile);
    } else {
      setError("Please select a valid Excel file (.xlsx or .xls)");
    }
  }, []);

  const handleClose = () => {
    setFile(null);
    setSheets([]);
    setActiveSheet(0);
    setError("");
  };

  const currentSheet = sheets[activeSheet];

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
              Upload Excel File
            </h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Select an Excel file (.xlsx or .xls) to view
            </p>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-slate-900 transition-all hover:bg-primary/90">
              <span className="material-symbols-outlined">folder_open</span>
              Choose File
              <input
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
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

      {/* Excel Viewer */}
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
            {currentSheet && (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {currentSheet.data.length} rows
              </div>
            )}
          </div>

          {/* Sheet Tabs */}
          {sheets.length > 1 && (
            <div className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
              {sheets.map((sheet, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSheet(index)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeSheet === index
                      ? "bg-primary text-slate-900"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {sheet.name}
                </button>
              ))}
            </div>
          )}

          {/* Excel Display */}
          <div className="flex-1 overflow-auto bg-slate-100 p-4 dark:bg-slate-950">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Loading Excel...</p>
                </div>
              </div>
            ) : currentSheet && currentSheet.data.length > 0 ? (
              <div className="overflow-auto rounded-lg bg-white shadow-lg">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      {currentSheet.data[0].map((header, index) => (
                        <th
                          key={index}
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {currentSheet.data.slice(1).map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-slate-50">
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="whitespace-nowrap px-6 py-4 text-sm text-slate-900"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">No data in this sheet</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
