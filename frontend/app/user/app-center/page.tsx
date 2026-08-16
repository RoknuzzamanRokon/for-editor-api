"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { API_BASE } from "@/lib/apiBase";
import { authFetch } from "@/lib/authFetch";

type ActionItem = {
  action: string;
  label: string;
};

type MyApiEntry = {
  action: string;
  label: string;
  allowed: boolean;
};

const toEditSlug = (action: string) => action.replace(/_/g, "-");

type ToolCategoryId = "pdf" | "image" | "other";

const ACTION_CATEGORY: Record<string, ToolCategoryId> = {
  pdf_to_docs: "pdf",
  pdf_to_excel: "pdf",
  docx_to_pdf: "pdf",
  excel_to_pdf: "pdf",
  pdf_page_remove: "pdf",
  merge_pdf: "pdf",
  split_pdf: "pdf",
  rotate_pdf: "pdf",
  protect_pdf: "pdf",
  unlock_pdf: "pdf",
  watermark_pdf: "pdf",
  pdf_page_numbers: "pdf",
  pdf_to_text: "pdf",
  text_to_pdf: "pdf",
  pptx_to_pdf: "pdf",
  pdf_to_pptx: "pdf",
  compress_pdf: "pdf",
  pdf_organize: "pdf",
  image_to_pdf: "image",
  remove_background: "image",
  image_format_convert: "image",
  pdf_to_image: "image",
};

const CATEGORY_SECTIONS: { id: ToolCategoryId; label: string; icon: string }[] = [
  { id: "pdf", label: "PDF Tools", icon: "picture_as_pdf" },
  { id: "image", label: "Image Tools", icon: "image" },
  { id: "other", label: "Other Tools", icon: "apps" },
];

// Map action to specific icon
function getIcon(action: string) {
  switch (action) {
    case 'pdf_to_docs':
      return 'description';
    case 'pdf_to_excel':
      return 'table_chart';
    case 'docx_to_pdf':
      return 'picture_as_pdf';
    case 'excel_to_pdf':
      return 'grid_on';
    case 'image_to_pdf':
      return 'image';
    case 'remove_background':
      return 'auto_fix_high';
    case 'pdf_page_remove':
      return 'delete_sweep';
    case 'merge_pdf':
      return 'merge';
    case 'split_pdf':
      return 'call_split';
    case 'rotate_pdf':
      return 'rotate_right';
    case 'protect_pdf':
      return 'lock';
    case 'unlock_pdf':
      return 'lock_open';
    case 'watermark_pdf':
      return 'branding_watermark';
    case 'pdf_page_numbers':
      return 'format_list_numbered';
    case 'pdf_to_text':
      return 'text_snippet';
    case 'text_to_pdf':
      return 'note_add';
    case 'pptx_to_pdf':
      return 'slideshow';
    case 'pdf_to_image':
      return 'photo_library';
    case 'image_format_convert':
      return 'sync_alt';
    case 'compress_pdf':
      return 'compress';
    case 'pdf_organize':
      return 'reorder';
    case 'pdf_to_pptx':
      return 'co_present';
    case 'zip_files':
      return 'folder_zip';
    case 'unzip_file':
      return 'unarchive';
    case 'csv_to_excel':
      return 'grid_on';
    case 'excel_to_csv':
      return 'csv';
    case 'html_to_pdf':
      return 'html';
    case 'pdf_to_html':
      return 'code';
    default:
      return 'apps';
  }
}

// Map action to short smart name
function getShortName(action: string, fallbackLabel: string) {
  switch (action) {
    case 'pdf_to_docs':
      return 'PDF→Word';
    case 'pdf_to_excel':
      return 'PDF→Excel';
    case 'docx_to_pdf':
      return 'Word→PDF';
    case 'excel_to_pdf':
      return 'Excel→PDF';
    case 'image_to_pdf':
      return 'Image→PDF';
    case 'remove_background':
      return 'Remove BG';
    case 'pdf_page_remove':
      return 'Delete Pages';
    case 'merge_pdf':
      return 'Merge PDF';
    case 'split_pdf':
      return 'Split PDF';
    case 'rotate_pdf':
      return 'Rotate PDF';
    case 'protect_pdf':
      return 'Protect PDF';
    case 'unlock_pdf':
      return 'Unlock PDF';
    case 'watermark_pdf':
      return 'Watermark';
    case 'pdf_page_numbers':
      return 'Page Numbers';
    case 'pdf_to_text':
      return 'PDF→Text';
    case 'text_to_pdf':
      return 'Text→PDF';
    case 'pptx_to_pdf':
      return 'PPT→PDF';
    case 'pdf_to_image':
      return 'PDF→Image';
    case 'image_format_convert':
      return 'Image Convert';
    case 'compress_pdf':
      return 'Compress PDF';
    case 'pdf_organize':
      return 'Organize Pages';
    case 'pdf_to_pptx':
      return 'PDF→PPT';
    case 'zip_files':
      return 'Zip Files';
    case 'unzip_file':
      return 'Unzip Archive';
    case 'csv_to_excel':
      return 'CSV→Excel';
    case 'excel_to_csv':
      return 'Excel→CSV';
    case 'html_to_pdf':
      return 'HTML→PDF';
    case 'pdf_to_html':
      return 'PDF→HTML';
    default:
      return fallbackLabel;
  }
}

/** Groups actions into the fixed category sections, dropping empty ones. */
function groupByCategory(items: ActionItem[]) {
  const groups = new Map<ToolCategoryId, ActionItem[]>();
  for (const item of items) {
    const category = ACTION_CATEGORY[item.action] ?? "other";
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category)!.push(item);
  }
  return CATEGORY_SECTIONS.map((section) => ({
    ...section,
    items: groups.get(section.id) ?? [],
  })).filter((section) => section.items.length > 0);
}

export default function DashboardAppCenterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname?.startsWith("/demo-user") ? "/demo-user" : "/user";
  // The demo account previews every tool in the catalog: unlocked ones stay
  // usable, the rest show up as locked "Other Apps" so visitors can see the
  // full lineup without a real account being able to run premium-gated tools.
  const isDemoUser = basePath === "/demo-user";
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [lockedActions, setLockedActions] = useState<ActionItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    authFetch(`${API_BASE}/api/v3/permissions/my-api`, {
      method: "GET",
    })
      .then(async (res) => {
        const body = await res.text();
        if (!res.ok) {
          throw new Error(body || "Failed to load actions");
        }
        const parsed = JSON.parse(body) as { user_id: number; apis: MyApiEntry[] };
        const apis = Array.isArray(parsed.apis) ? parsed.apis : [];
        const toActionItem = (item: MyApiEntry) => ({
          action: item.action,
          label: item.label,
        });
        setActions(apis.filter((item) => item.allowed).map(toActionItem));
        setLockedActions(apis.filter((item) => !item.allowed).map(toActionItem));
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load actions");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredActions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return actions;
    return actions.filter((item) => {
      return (
        item.action.toLowerCase().includes(keyword) ||
        item.label.toLowerCase().includes(keyword)
      );
    });
  }, [actions, search]);

  useEffect(() => {
    actions.slice(0, 24).forEach((item) => {
      router.prefetch(`${basePath}/app-center/edit/${toEditSlug(item.action)}`);
    });
  }, [actions, router, basePath]);

  const groupedActions = useMemo(
    () => groupByCategory(filteredActions),
    [filteredActions],
  );

  const groupedLockedActions = useMemo(
    () => (isDemoUser ? groupByCategory(lockedActions) : []),
    [isDemoUser, lockedActions],
  );

  return (
      <section className="h-full min-h-full overflow-y-auto  px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto w-full max-w-8xl">
          <section className="app-hero-card relative mb-6 overflow-hidden rounded-[13px] border-2 border-slate-200/30 p-5 text-white shadow-xl sm:p-8 dark:border-slate-800/30">
            <div className="absolute inset-0 rounded-[13px] overflow-hidden pointer-events-none">
              {/* <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent top-0 left-0 animate-[borderLightTop_8s_linear_infinite]"></div> */}
              <div className="absolute w-[2px] h-full bg-gradient-to-b from-transparent via-primary to-transparent top-0 right-0 animate-[borderLightRight_8s_linear_infinite_2s]"></div>
              <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent bottom-0 right-0 animate-[borderLightBottom_8s_linear_infinite_4s]"></div>
              {/* <div className="absolute w-[2px] h-full bg-gradient-to-b from-transparent via-primary to-transparent bottom-0 left-0 animate-[borderLightLeft_8s_linear_infinite_6s]"></div> */}
            </div>
           
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-center">
                <h1 className="mt-0 text-3xl font-black tracking-tight text-white md:text-4xl text-center">
                  App Center
                </h1>


            </div>
          </section>

          {loading ? (
            <div className="mx-auto w-full lg:w-[70%] rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="grid grid-cols-3 gap-6 lg:grid-cols-5">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="flex justify-center">
                    <div className="h-24 w-24 animate-pulse rounded-full border-2 border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800" />
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {error}
            </div>
          ) : (
            <div className="app-panel-card mx-auto w-full lg:w-[70%] rounded-xl border border-slate-200 p-6 dark:border-slate-800 ">
              <h2 className="mb-6 text-xl font-bold text-slate-800 dark:text-slate-200">
                Editor Panel
              </h2>
              <div className="space-y-6">
                {groupedActions.map((section) => (
                  <div
                    key={section.id}
                    className="app-subcard rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/20"
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">
                        {section.icon}
                      </span>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        {section.label}
                      </h3>
                      <span className="ml-auto rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                        {section.items.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-6 lg:grid-cols-5">
                      {section.items.map((item) => {
                        const editHref = `${basePath}/app-center/edit/${toEditSlug(item.action)}`;

                        return (
                          <div key={item.action} className="flex flex-col items-center gap-2">
                            <Link
                              href={editHref}
                              prefetch
                              onMouseEnter={() => router.prefetch(editHref)}
                              onFocus={() => router.prefetch(editHref)}
                              className="group relative flex h-24 w-24 items-center justify-center rounded-xl border-2 border-slate-200  from-slate-900 via-slate-800 to-primary shadow-[2px_2px_0px_rgba(255,255,30,0.9)] transition-all hover:scale-110 hover:shadow-[4px_2px_0px_rgba(255,255,255,1)] dark:border-slate-800 neo-shadow active-neo group-hover:bg-[#ffcc00]"
                              title={item.label}
                            >
                              <span className="material-symbols-outlined text-5xl text-primary">
                                {getIcon(item.action)}
                              </span>
                            </Link>
                            <span className="text-xs pt-4 font-bold text-slate-700 dark:text-slate-300">
                              {getShortName(item.action, item.label)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {filteredActions.length === 0 ? (
                  <div className="rounded-xl border border-primary/10 bg-primary/5 p-5 text-center text-sm text-slate-500">
                    No actions found.
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {isDemoUser && groupedLockedActions.length > 0 ? (
            <div className="app-panel-card mx-auto mt-6 w-full rounded-xl border border-slate-200 p-6 dark:border-slate-800 lg:w-[70%]">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500">
                    workspace_premium
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                      Other Apps
                    </h2>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Preview only in demo mode — unlocked on premium plans
                    </p>
                  </div>
                  <span className="ml-1 rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                    {lockedActions.length}
                  </span>
                </div>
                <Link
                  href={`${basePath}/billing`}
                  className="inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-amber-500 to-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90 sm:self-auto"
                >
                  <span className="material-symbols-outlined text-base">bolt</span>
                  Upgrade to Premium
                </Link>
              </div>

              <div className="space-y-6">
                {groupedLockedActions.map((section) => (
                  <div
                    key={section.id}
                    className="app-subcard rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/20"
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400">
                        {section.icon}
                      </span>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {section.label}
                      </h3>
                      <span className="ml-auto rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                        {section.items.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-6 lg:grid-cols-5">
                      {section.items.map((item) => (
                        <div key={item.action} className="flex flex-col items-center gap-1.5">
                          <div
                            role="img"
                            aria-label={`${item.label} — premium feature, not available in demo mode`}
                            title="Premium feature — upgrade to unlock"
                            className="relative flex h-24 w-24 cursor-not-allowed items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/70 grayscale dark:border-slate-700 dark:bg-slate-900/40"
                          >
                            <span className="material-symbols-outlined text-5xl text-slate-400 dark:text-slate-600">
                              {getIcon(item.action)}
                            </span>
                            <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-white shadow-sm dark:bg-slate-600">
                              <span className="material-symbols-outlined text-sm">lock</span>
                            </span>
                          </div>
                          <span className="pt-1 text-xs font-bold text-slate-400 dark:text-slate-500">
                            {getShortName(item.action, item.label)}
                          </span>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                            Premium
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Viewer Panel Card */}
          <div className="app-panel-card mx-auto w-full lg:w-[70%] rounded-xl border border-slate-200 p-6 dark:border-slate-800 mt-6">
            <h2 className="mb-6 text-xl font-bold text-slate-800 dark:text-slate-200">
              Viewer Panel
            </h2>
            <div className="grid grid-cols-3 gap-6 lg:grid-cols-5">
              {[
                { action: 'pdf_reader', label: 'PDF Reader', icon: 'picture_as_pdf' },
                { action: 'docs_reader', label: 'Docs Reader', icon: 'description' },
                { action: 'csv_reader', label: 'CSV Reader', icon: 'table_view' },
                { action: 'excel_reader', label: 'Excel Reader', icon: 'grid_on' },
                { action: 'markdown_reader', label: 'Markdown Reader', icon: 'code' },
                { action: 'json_reader', label: 'JSON Reader', icon: 'data_object' },
                { action: 'xml_reader', label: 'XML Reader', icon: 'code_blocks' },
                { action: 'image_reader', label: 'Image Viewer', icon: 'image' },
                { action: 'pptx_reader', label: 'PowerPoint Viewer', icon: 'co_present' },
                { action: 'text_reader', label: 'Text/Code Viewer', icon: 'terminal' },
                { action: 'yaml_reader', label: 'YAML Viewer', icon: 'list_alt' },
              ].map((item) => {
                const viewHref = `${basePath}/app-center/view/${item.action}`;
                
                return (
                  <div key={item.action} className="flex flex-col items-center gap-2">
                    <Link
                      href={viewHref}
                      prefetch
                      onMouseEnter={() => router.prefetch(viewHref)}
                      onFocus={() => router.prefetch(viewHref)}
                      className="group relative flex h-24 w-24 items-center justify-center rounded-xl border-2 border-slate-200 from-slate-900 via-slate-800 to-primary shadow-[2px_2px_0px_rgba(255,255,30,0.9)] transition-all hover:scale-110 hover:shadow-[4px_2px_0px_rgba(255,255,255,1)] dark:border-slate-800 neo-shadow active-neo group-hover:bg-[#ffcc00]"
                      title={item.label}
                    >
                      <span className="material-symbols-outlined text-5xl text-primary">
                        {item.icon}
                      </span>
                    </Link>
                    <span className="text-xs pt-4 font-bold text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
  );
}
