"use client";

import { useState } from "react";
import { ZMAN_LABELS } from "@/lib/labels";

interface Props {
  title: string;
  data: Record<string, string | null>;
  timezone: string;
  defaultOpen?: boolean;
  icon?: string;
}

function formatTime(isoStr: string | null, timezone: string): string {
  if (!isoStr) return "—";
  try {
    const date = new Date(isoStr);
    return date.toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return isoStr;
  }
}

function isDuration(value: string): boolean {
  return /^\d+:\d{2} min$/.test(value);
}

export default function ZmanimSection({ title, data, timezone, defaultOpen = false, icon }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  const entries = Object.entries(data).filter(([, v]) => v !== null);
  if (entries.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              {title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {entries.length} formula{entries.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-slate-100 dark:border-slate-700">
          <table className="w-full text-sm">
            <tbody>
              {entries.map(([key, value], i) => {
                const label = ZMAN_LABELS[key] ?? key;
                const formatted = value
                  ? isDuration(value)
                    ? value
                    : formatTime(value, timezone)
                  : "—";

                return (
                  <tr
                    key={key}
                    className={`${i % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-50 dark:bg-slate-750"}
                      hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors`}
                  >
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300 font-medium w-2/3">
                      {label}
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-blue-700 dark:text-blue-400 font-semibold tabular-nums">
                      {formatted}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
