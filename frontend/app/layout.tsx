import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import RouteHtmlState from "@/components/RouteHtmlState";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PDF Converter Pro",
  description: "Convert PDF files to Excel and Word documents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(dmSans.variable, jetbrains.variable, "font-sans", "light")} data-theme="light">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var stored = localStorage.getItem('theme');
                  var themes = ['light', 'dark', 'ocean', 'sunset', 'forest', 'midnight', 'livedark'];
                  var theme = themes.indexOf(stored) !== -1 ? stored : 'light';
                  var root = document.documentElement;
                  var marketingStored = localStorage.getItem('marketing-theme');
                  var marketingTheme = marketingStored === 'dark' ? 'dark' : 'light';
                  if (window.location && window.location.pathname === '/login') {
                    root.classList.add('login-fullscreen');
                    root.style.overflow = 'hidden';
                    if (document.body) document.body.style.overflow = 'hidden';
                  }
                  var applyTheme = function (nextTheme) {
                    root.classList.remove('light', 'dark', 'ocean', 'sunset', 'forest', 'midnight', 'livedark');
                    root.classList.add(nextTheme);
                    if (nextTheme !== 'light') root.classList.add('dark');
                  };
                  localStorage.setItem('theme', theme);
                  if (theme !== 'light') {
                    localStorage.setItem('theme_last_non_light', theme);
                  }
                  root.setAttribute('data-theme', marketingTheme);
                  applyTheme(theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <RouteHtmlState />
          <div className="app-scale">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
