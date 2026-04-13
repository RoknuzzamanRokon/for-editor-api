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
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var stored = localStorage.getItem('theme');
                  var themes = ['light', 'dark', 'ocean', 'sunset', 'forest', 'midnight', 'livedark'];
                  var theme = themes.indexOf(stored) !== -1 ? stored : 'light';
                  var root = document.documentElement;
                  var applyTheme = function (nextTheme) {
                    root.classList.remove('light', 'dark', 'ocean', 'sunset', 'forest', 'midnight', 'livedark');
                    root.classList.add(nextTheme);
                    if (nextTheme !== 'light') root.classList.add('dark');
                  };
                  window.__applyTheme = applyTheme;
                  window.__getCurrentTheme = function () {
                    var current = localStorage.getItem('theme');
                    return themes.indexOf(current) !== -1 ? current : 'light';
                  };
                  window.__getLastNonLightTheme = function () {
                    var last = localStorage.getItem('theme_last_non_light');
                    return themes.indexOf(last) !== -1 && last !== 'light' ? last : 'dark';
                  };
                  window.__setMarketingTheme = function (mode) {
                    var currentTheme = window.__getCurrentTheme();
                    if (currentTheme !== 'light') {
                      localStorage.setItem('theme_last_non_light', currentTheme);
                    }
                    var nextTheme = mode === 'light' ? 'light' : window.__getLastNonLightTheme();
                    if (nextTheme !== 'light') {
                      localStorage.setItem('theme_last_non_light', nextTheme);
                    }
                    localStorage.setItem('theme', nextTheme);
                    applyTheme(nextTheme);
                    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: nextTheme } }));
                  };
                  window.__toggleMarketingTheme = function () {
                    var currentTheme = window.__getCurrentTheme();
                    window.__setMarketingTheme(currentTheme === 'light' ? 'current' : 'light');
                  };
                  if (theme !== 'light') {
                    localStorage.setItem('theme_last_non_light', theme);
                  }
                  applyTheme(theme);
                  window.__syncMarketingThemeButtons = function () {
                    var currentTheme = window.__getCurrentTheme();
                    var themeButtons = document.querySelectorAll('[data-theme-toggle]');
                    var themeMeta = {
                      light: { icon: 'light_mode', color: '#f59e0b', bg: 'rgba(245,158,11,0.14)', border: 'rgba(245,158,11,0.26)' },
                      dark: { icon: 'dark_mode', color: '#60a5fa', bg: 'rgba(96,165,250,0.14)', border: 'rgba(96,165,250,0.24)' },
                      ocean: { icon: 'water', color: '#06b6d4', bg: 'rgba(6,182,212,0.14)', border: 'rgba(6,182,212,0.24)' },
                      sunset: { icon: 'wb_twilight', color: '#f97316', bg: 'rgba(249,115,22,0.14)', border: 'rgba(249,115,22,0.24)' },
                      forest: { icon: 'park', color: '#22c55e', bg: 'rgba(34,197,94,0.14)', border: 'rgba(34,197,94,0.24)' },
                      midnight: { icon: 'bedtime', color: '#38bdf8', bg: 'rgba(56,189,248,0.14)', border: 'rgba(56,189,248,0.24)' },
                      livedark: { icon: 'radio_button_checked', color: '#3b82f6', bg: 'rgba(59,130,246,0.16)', border: 'rgba(59,130,246,0.28)' }
                    };
                    var activeTheme = currentTheme === 'light' ? 'light' : currentTheme;
                    var meta = themeMeta[activeTheme] || themeMeta.dark;
                    themeButtons.forEach(function (button) {
                      button.style.color = meta.color;
                      button.style.backgroundColor = meta.bg;
                      button.style.borderColor = meta.border;
                      button.setAttribute('title', currentTheme === 'light' ? 'Switch to current theme' : 'Switch to light theme');
                      var iconNode = button.querySelector('[data-theme-toggle-icon]');
                      if (iconNode) iconNode.textContent = meta.icon;
                    });
                  };
                  document.addEventListener('DOMContentLoaded', window.__syncMarketingThemeButtons);
                  window.addEventListener('themechange', window.__syncMarketingThemeButtons);
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
