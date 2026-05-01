import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DM_Sans, Inter, Roboto, Open_Sans, Lato, Montserrat, Oswald, Poppins, Raleway, Source_Sans_3, Noto_Serif, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import RouteHtmlState from "@/components/RouteHtmlState";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  weight: ["400", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto-serif",
  weight: ["400", "500", "600", "700"],
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
    <html lang="en" suppressHydrationWarning className={cn(dmSans.variable, inter.variable, roboto.variable, openSans.variable, lato.variable, montserrat.variable, oswald.variable, poppins.variable, raleway.variable, sourceSans.variable, notoSerif.variable, jetbrains.variable, "font-sans", "sunset")} data-theme="sunset" data-font="dm_sans">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var stored = localStorage.getItem('theme');
                  var themes = ['ocean', 'sunset', 'forest'];
                  var theme = themes.indexOf(stored) !== -1 ? stored : 'sunset';
                  var root = document.documentElement;
                  if (window.location && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
                    root.classList.add('login-fullscreen');
                    root.style.overflow = 'hidden';
                    if (document.body) document.body.style.overflow = 'hidden';
                  }
                  var applyTheme = function (nextTheme) {
                    root.classList.remove('light', 'dark', 'ocean', 'sunset', 'forest', 'midnight', 'livedark');
                    root.classList.add(nextTheme);
                    if (nextTheme !== 'light') {
                      root.classList.add('dark');
                    }
                  };
                  localStorage.setItem('theme', theme);
                  localStorage.removeItem('marketing-theme');
                  localStorage.removeItem('theme_last_non_light');
                  root.setAttribute('data-theme', 'sunset');
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
