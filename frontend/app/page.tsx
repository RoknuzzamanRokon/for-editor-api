"use client";

import { useState, useEffect } from "react";
import ExcelConverter from "@/components/ExcelConverter";
import DocsConverter from "@/components/DocsConverter";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"excel" | "docs">("excel");
  const [stats, setStats] = useState({
    total: 0,
    excel: 0,
    word: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem("pdfConverterStats");
    if (saved) {
      const parsed = JSON.parse(saved);
      setStats({
        total: parsed.totalConversions || 0,
        excel: parsed.excelConversions || 0,
        word: parsed.wordConversions || 0,
      });
    }
  }, []);

  const updateStats = (type: "excel" | "word") => {
    const newStats = {
      total: stats.total + 1,
      excel: type === "excel" ? stats.excel + 1 : stats.excel,
      word: type === "word" ? stats.word + 1 : stats.word,
    };
    setStats(newStats);
    localStorage.setItem(
      "pdfConverterStats",
      JSON.stringify({
        totalConversions: newStats.total,
        excelConversions: newStats.excel,
        wordConversions: newStats.word,
      })
    );
  };

  return (
    <div className="min-h-screen p-5">
      <div className="max-w-7xl mx-auto bg-[rgba(20,20,22,0.9)] rounded-2xl shadow-2xl p-10 backdrop-blur-sm border border-white/5">
        {/* Header */}
        <header className="text-center mb-10 pb-8 border-b border-white/10 relative">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded" />
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
            📄 PDF Converter Pro
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Convert your PDF files to Excel spreadsheets or Word documents with
            high accuracy. Supports tables, text, and formatting extraction.
            Maximum file size: 50MB.
          </p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <div className="bg-gradient-to-br from-[rgba(30,30,35,0.8)] to-[rgba(40,40,45,0.8)] p-6 rounded-xl text-center border border-white/5 hover:transform hover:-translate-y-1 transition-all">
            <div className="text-4xl font-bold text-blue-500 mb-2">
              {stats.total}
            </div>
            <div className="text-gray-400">Total Conversions</div>
          </div>
          <div className="bg-gradient-to-br from-[rgba(30,30,35,0.8)] to-[rgba(40,40,45,0.8)] p-6 rounded-xl text-center border border-white/5 hover:transform hover:-translate-y-1 transition-all">
            <div className="text-4xl font-bold text-blue-500 mb-2">
              {stats.excel}
            </div>
            <div className="text-gray-400">Excel Conversions</div>
          </div>
          <div className="bg-gradient-to-br from-[rgba(30,30,35,0.8)] to-[rgba(40,40,45,0.8)] p-6 rounded-xl text-center border border-white/5 hover:transform hover:-translate-y-1 transition-all">
            <div className="text-4xl font-bold text-blue-500 mb-2">
              {stats.word}
            </div>
            <div className="text-gray-400">Word Conversions</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex gap-2 mb-10 bg-[rgba(30,30,35,0.8)] p-2 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab("excel")}
            className={`flex-1 py-4 px-8 rounded-lg font-semibold text-lg transition-all ${
              activeTab === "excel"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            📊 PDF to Excel
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`flex-1 py-4 px-8 rounded-lg font-semibold text-lg transition-all ${
              activeTab === "docs"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            📝 PDF to Word
          </button>
        </nav>

        {/* Tab Content */}
        {activeTab === "excel" ? (
          <ExcelConverter onSuccess={() => updateStats("excel")} />
        ) : (
          <DocsConverter onSuccess={() => updateStats("word")} />
        )}

        {/* Footer */}
        <footer className="mt-10 pt-6 text-center text-gray-500 text-sm border-t border-white/5">
          © 2026 PDF Converter Pro | Secure & Fast Conversion | All files are
          processed securely and deleted after 24 hours
        </footer>
      </div>
    </div>
  );
}
