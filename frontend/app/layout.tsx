import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
