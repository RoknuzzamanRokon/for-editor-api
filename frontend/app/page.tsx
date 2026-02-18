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
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 pb-6 border-b border-black">
          <h1 className="text-2xl font-bold tracking-tight mb-2 text-black">
            PDF Converter
          </h1>
          <p className="text-sm text-black">
            Convert PDF files to Excel or Word format
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="border border-black p-4 hover:bg-gray-100 transition-colors">
            <div className="text-2xl font-bold tabular-nums mb-1 text-black">
              {stats.total}
            </div>
            <div className="text-xs text-black uppercase tracking-wider">
              Total
            </div>
          </div>

          <div className="border border-black p-4 hover:bg-gray-100 transition-colors">
            <div className="text-2xl font-bold tabular-nums mb-1 text-black">
              {stats.excel}
            </div>
            <div className="text-xs text-black uppercase tracking-wider">
              Excel
            </div>
          </div>

          <div className="border border-black p-4 hover:bg-gray-100 transition-colors">
            <div className="text-2xl font-bold tabular-nums mb-1 text-black">
              {stats.word}
            </div>
            <div className="text-xs text-black uppercase tracking-wider">
              Word
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex gap-0 mb-8 border border-black">
          <button
            onClick={() => setActiveTab("excel")}
            className={`flex-1 py-3 px-6 text-sm font-medium uppercase tracking-wider transition-all ${
              activeTab === "excel"
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            Excel
          </button>
          <div className="w-px bg-black" />
          <button
            onClick={() => setActiveTab("docs")}
            className={`flex-1 py-3 px-6 text-sm font-medium uppercase tracking-wider transition-all ${
              activeTab === "docs"
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            Word
          </button>
        </nav>

        {/* Tab Content */}
        <div className="border border-black p-6 bg-white">
          {activeTab === "excel" ? (
            <ExcelConverter onSuccess={() => updateStats("excel")} />
          ) : (
            <DocsConverter onSuccess={() => updateStats("word")} />
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 text-center border-t border-black">
          <p className="text-xs text-black">
            © 2026 PDF Converter · Secure Processing · 24H Auto-Delete
          </p>
        </footer>
      </div>
    </div>
  );
}
