"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("@/components/viewers/PDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-slate-600 dark:text-slate-400">Loading viewer...</p>
      </div>
    </div>
  ),
});

const DocsViewer = dynamic(() => import("@/components/viewers/DocsViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-slate-600 dark:text-slate-400">Loading viewer...</p>
      </div>
    </div>
  ),
});

const CSVViewer = dynamic(() => import("@/components/viewers/CSVViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-slate-600 dark:text-slate-400">Loading viewer...</p>
      </div>
    </div>
  ),
});

const ExcelViewer = dynamic(() => import("@/components/viewers/ExcelViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-slate-600 dark:text-slate-400">Loading viewer...</p>
      </div>
    </div>
  ),
});

const MarkdownViewer = dynamic(() => import("@/components/viewers/MarkdownViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-slate-600 dark:text-slate-400">Loading viewer...</p>
      </div>
    </div>
  ),
});

const JSONViewer = dynamic(() => import("@/components/viewers/JSONViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-slate-600 dark:text-slate-400">Loading viewer...</p>
      </div>
    </div>
  ),
});

export default function ViewerPage() {
  const params = useParams();
  const viewer = params.viewer as string;

  const viewerNames: Record<string, string> = {
    pdf_reader: "PDF Reader",
    docs_reader: "Docs Reader",
    csv_reader: "CSV Reader",
    excel_reader: "Excel Reader",
    markdown_reader: "Markdown Reader",
    json_reader: "JSON Reader",
  };

  const viewerIcons: Record<string, string> = {
    pdf_reader: "picture_as_pdf",
    docs_reader: "description",
    csv_reader: "table_view",
    excel_reader: "grid_on",
    markdown_reader: "code",
    json_reader: "data_object",
  };

  const name = viewerNames[viewer] || "Viewer";
  const icon = viewerIcons[viewer] || "visibility";

  // PDF Reader has full implementation
  if (viewer === "pdf_reader") {
    return (
      <section className="flex h-full flex-col overflow-hidden">
        <div className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/app-center"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back to App Center
            </Link>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {name}
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <PDFViewer />
        </div>
      </section>
    );
  }

  // Docs Reader implementation
  if (viewer === "docs_reader") {
    return (
      <section className="flex h-full flex-col overflow-hidden">
        <div className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/app-center"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back to App Center
            </Link>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {name}
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <DocsViewer />
        </div>
      </section>
    );
  }

  // CSV Reader implementation
  if (viewer === "csv_reader") {
    return (
      <section className="flex h-full flex-col overflow-hidden">
        <div className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/app-center"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back to App Center
            </Link>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {name}
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <CSVViewer />
        </div>
      </section>
    );
  }

  // Excel Reader implementation
  if (viewer === "excel_reader") {
    return (
      <section className="flex h-full flex-col overflow-hidden">
        <div className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/app-center"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back to App Center
            </Link>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {name}
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ExcelViewer />
        </div>
      </section>
    );
  }

  // Markdown Reader implementation
  if (viewer === "markdown_reader") {
    return (
      <section className="flex h-full flex-col overflow-hidden">
        <div className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/app-center"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back to App Center
            </Link>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {name}
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <MarkdownViewer />
        </div>
      </section>
    );
  }

  // JSON Reader implementation
  if (viewer === "json_reader") {
    return (
      <section className="flex h-full flex-col overflow-hidden">
        <div className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/app-center"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back to App Center
            </Link>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {name}
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <JSONViewer />
        </div>
      </section>
    );
  }

  // Other viewers show coming soon
  return (
    <section className="h-full min-h-full overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6">
          <Link
            href="/dashboard/app-center"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to App Center
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/5">
            <span className="material-symbols-outlined text-7xl text-primary">
              {icon}
            </span>
          </div>
          
          <h1 className="mb-4 text-3xl font-bold text-slate-800 dark:text-slate-200">
            {name}
          </h1>
          
          <div className="mx-auto max-w-md">
            <p className="mb-6 text-lg text-slate-600 dark:text-slate-400">
              Coming Soon
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              This viewer is currently under development and will be available soon.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
