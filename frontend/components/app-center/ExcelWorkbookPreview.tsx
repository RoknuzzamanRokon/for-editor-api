"use client";

import { useEffect, useMemo, useState } from "react";

type WorkbookSheet = {
  name: string;
  rows: string[][];
  maxColumns: number;
};

type ExcelWorkbookPreviewProps = {
  sourceBlob: Blob | null;
  filename: string;
  downloadUrl: string;
};

const FRAME_CLASS =
  "relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/70";

function normalizeCell(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toLocaleString();
  return String(value);
}

function ExcelWorkbookPreview({
  sourceBlob,
  filename,
  downloadUrl,
}: ExcelWorkbookPreviewProps) {
  const [sheets, setSheets] = useState<WorkbookSheet[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    if (!sourceBlob) {
      setSheets([]);
      setActiveSheet(0);
      setLoading(false);
      setError("");
      return;
    }

    const loadWorkbook = async () => {
      try {
        setLoading(true);
        setError("");

        const XLSX = await import("xlsx");
        const arrayBuffer = await sourceBlob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });

        const nextSheets = workbook.SheetNames.map((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const rows = (XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: "",
            raw: false,
            blankrows: true,
          }) as unknown[][]).map((row) => row.map(normalizeCell));

          const maxColumns = rows.reduce(
            (largest, row) => Math.max(largest, row.length),
            0,
          );

          return {
            name: sheetName,
            rows,
            maxColumns,
          };
        }).filter((sheet) => sheet.maxColumns > 0 || sheet.rows.length > 0);

        if (!cancelled) {
          setSheets(nextSheets);
          setActiveSheet(0);
          if (nextSheets.length === 0) {
            setError("This workbook does not contain any visible sheet data.");
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setSheets([]);
          setActiveSheet(0);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to render Excel preview.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadWorkbook();

    return () => {
      cancelled = true;
    };
  }, [sourceBlob]);

  const currentSheet = sheets[activeSheet] ?? null;
  const columnCount = useMemo(() => {
    if (!currentSheet) return 0;
    return Math.max(currentSheet.maxColumns, 1);
  }, [currentSheet]);

  if (error) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          {error}
        </div>
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 dark:border-slate-700">
          <p className="text-sm text-slate-500">
            Excel preview could not be rendered inline. You can still download the file.
          </p>
          <a
            href={downloadUrl}
            download={filename}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Download Preview File
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={FRAME_CLASS}>
      <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="flex flex-wrap gap-2">
          {sheets.map((sheet, index) => {
            const selected = index === activeSheet;

            return (
              <button
                key={sheet.name}
                type="button"
                onClick={() => setActiveSheet(index)}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  selected
                    ? "bg-primary text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {sheet.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative max-h-[936px] overflow-auto">
        {loading ? (
          <div className="sticky top-0 z-10 inline-flex rounded-br-xl bg-white/95 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur dark:bg-slate-900/95 dark:text-slate-200">
            Rendering workbook...
          </div>
        ) : null}

        {currentSheet ? (
          <table className="min-w-full border-collapse text-sm">
            <thead className="sticky top-0 z-[1] bg-slate-100 dark:bg-slate-900">
              <tr>
                <th className="border-b border-r border-slate-200 bg-slate-100 px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                  #
                </th>
                {Array.from({ length: columnCount }, (_, index) => (
                  <th
                    key={`column-${index + 1}`}
                    className="min-w-[140px] border-b border-r border-slate-200 bg-slate-100 px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900"
                  >
                    {index + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentSheet.rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex + 1}`} className="align-top">
                  <td className="border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                    {rowIndex + 1}
                  </td>
                  {Array.from({ length: columnCount }, (_, cellIndex) => (
                    <td
                      key={`cell-${rowIndex + 1}-${cellIndex + 1}`}
                      className="border-b border-r border-slate-200 px-3 py-2 whitespace-pre-wrap text-slate-700 dark:border-slate-800 dark:text-slate-200"
                    >
                      {row[cellIndex] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-sm text-slate-500">No workbook data available.</div>
        )}
      </div>
    </div>
  );
}

export default ExcelWorkbookPreview;
