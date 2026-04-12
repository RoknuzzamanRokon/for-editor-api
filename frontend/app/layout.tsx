import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

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
    <html lang="en" suppressHydrationWarning className={cn(dmSans.variable, jetbrains.variable, "font-sans")}>
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
                  root.classList.remove('light', 'dark', 'ocean', 'sunset', 'forest', 'midnight', 'livedark');
                  root.classList.add(theme);
                  if (theme !== 'light') root.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <div className="app-scale">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
