"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const TechumMap = dynamic(() => import("@/components/TechumMap"), { ssr: false });

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export default function TechumPage() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm z-20 flex-shrink-0">
        <div className="max-w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
            >
              ← Zmanim
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                Techum Shabbos
              </h1>
              <p className="text-xs text-gray-500">2000 Amot Boundary Calculator</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">תחום שבת</p>
            <p className="text-xs text-gray-300 mt-0.5">for educational purposes only</p>
          </div>
        </div>
      </header>

      {/* Map fills remaining height */}
      <div className="flex-1 overflow-hidden">
        {!API_KEY ? (
          <div className="flex items-center justify-center h-full">
            <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-8 max-w-md text-center">
              <div className="text-4xl mb-4">🗺️</div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">Google Maps API Key Required</h2>
              <p className="text-gray-500 text-sm mb-4">
                To use the Techum Shabbos map, add your Google Maps API key to the environment:
              </p>
              <div className="bg-gray-50 rounded-lg px-4 py-3 font-mono text-xs text-gray-700 text-left border border-gray-200">
                NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
              </div>
              <p className="text-gray-400 text-xs mt-4">
                Create a <code className="bg-gray-100 px-1 rounded">.env.local</code> file in the project root and restart the dev server.
              </p>
              <p className="text-gray-400 text-xs mt-2">
                You need the <strong>Maps JavaScript API</strong> and <strong>Places API</strong> enabled.
              </p>
            </div>
          </div>
        ) : (
          <TechumMap apiKey={API_KEY} />
        )}
      </div>
    </div>
  );
}
