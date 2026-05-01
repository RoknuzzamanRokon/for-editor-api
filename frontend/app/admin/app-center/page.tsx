"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function AdminAppCenterPage() {
  const router = useRouter();
  const [actions, setActions] = useState<ActionItem[]>([]);
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
        const activeOnly = Array.isArray(parsed.apis)
          ? parsed.apis
              .filter((item) => item.allowed)
              .map((item) => ({
                action: item.action,
                label: item.label,
              }))
          : [];
        setActions(activeOnly);
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
      router.prefetch(`/admin/app-center/edit/${toEditSlug(item.action)}`);
    });
  }, [actions, router]);

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
            <div className="mx-auto w-full lg:w-[70%] rounded-xl border border-slate-200 p-6 dark:border-slate-800 ">
              <h2 className="mb-6 text-xl font-bold text-slate-800 dark:text-slate-200">
                Editor Panel
              </h2>
              <div className="grid grid-cols-3 gap-6 lg:grid-cols-5">
                {filteredActions.map((item) => {
                  const editHref = `/admin/app-center/edit/${toEditSlug(item.action)}`;
                  
                  // Map action to specific icon
                  const getIcon = (action: string) => {
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
                      default:
                        return 'apps';
                    }
                  };
                  
                  // Map action to short smart name
                  const getShortName = (action: string) => {
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
                      default:
                        return item.label;
                    }
                  };
                  
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
                        {getShortName(item.action)}
                      </span>
                    </div>
                  );
                })}
                {filteredActions.length === 0 ? (
                  <div className="col-span-full rounded-xl border border-primary/10 bg-primary/5 p-5 text-center text-sm text-slate-500">
                    No actions found.
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Viewer Panel Card */}
          <div className="mx-auto w-full lg:w-[70%] rounded-xl border border-slate-200 p-6 dark:border-slate-800 mt-6">
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
              ].map((item) => {
                const viewHref = `/admin/app-center/view/${item.action}`;
                
                return (
                  <div key={item.action} className="flex flex-col items-center gap-2">
                    <Link
                      href={viewHref}
                      prefetch
                      onMouseEnter={() => router.prefetch(viewHref)}
                      onFocus={() => router.prefetch(viewHref)}
                      className="group relative flex h-24 w-24 items-center justify-center rounded-xl border-2 border-slate-200 from-slate-900 via-slate-800 to-primary shadow-[2px_2px_0px_rgba(255,90,30,0.9)] transition-all hover:scale-110 hover:shadow-[4px_2px_0px_rgba(255,255,255,1)] dark:border-slate-800 neo-shadow active-neo group-hover:bg-[#ffcc00]"
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
