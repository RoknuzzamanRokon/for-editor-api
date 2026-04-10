"use client";

import { usePathname } from "next/navigation";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  usePathname();

  return (
    <>
      <style jsx global>{`
        [data-dashboard-legacy] > div > aside,
        [data-dashboard-legacy] > div > header,
        [data-dashboard-legacy] > div > main > header {
          display: none !important;
        }

        [data-dashboard-legacy] > div > main {
          margin-left: 0 !important;
          min-height: auto !important;
          width: 100% !important;
        }

        [data-dashboard-legacy] > div {
          min-height: auto !important;
        }
      `}</style>

      <div className="min-h-screen">
        <main className="min-w-0">
          <div className="flex-1 overflow-y-auto">
            <div data-dashboard-legacy>{children}</div>
          </div>
        </main>
      </div>
    </>
  );
}
