"use client";

import { useState } from "react";
import { ZMAN_LABELS } from "@/lib/labels";

interface Props {
  title: string;
  data: Record<string, string | null>;
  timezone: string;
  defaultOpen?: boolean;
  icon?: string;
  subtitle?: string;       // e.g. "Motzaei Shabbos" label shown in header
  accentColor?: string;    // tailwind border colour class e.g. "border-yellow-500"
}

function formatTime(isoStr: string | null, timezone: string): string {
  if (!isoStr) return "—";
  try {
    return new Date(isoStr).toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch { return isoStr; }
}

function isDuration(value: string): boolean {
  return /^\d+:\d{2} min$/.test(value);
}

function TimeRow({
  label, value, timezone, small,
}: { label: string; value: string | null; timezone: string; small?: boolean }) {
  const formatted = value
    ? isDuration(value) ? value : formatTime(value, timezone)
    : "—";

  return (
    <tr className="border-b border-slate-100 dark:border-slate-700/50 last:border-0
                   hover:bg-blue-50 dark:hover:bg-slate-700/40 transition-colors">
      <td className={`px-5 py-2.5 text-slate-600 dark:text-slate-300 ${small ? "text-xs" : "text-sm font-medium"}`}>
        {label}
      </td>
      <td className={`px-5 py-2.5 text-right font-mono tabular-nums ${
        small ? "text-xs text-blue-600 dark:text-blue-300" : "text-sm text-blue-700 dark:text-blue-400 font-semibold"
      }`}>
        {formatted}
      </td>
    </tr>
  );
}

export default function ZmanimSection({
  title, data, timezone, defaultOpen = false, icon, subtitle, accentColor,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  // Split regular vs motzaei_ prefixed entries
  const allEntries = Object.entries(data).filter(([, v]) => v !== null);
  const regular  = allEntries.filter(([k]) => !k.startsWith("motzaei_"));
  const motzaei  = allEntries.filter(([k]) =>  k.startsWith("motzaei_"));

  if (allEntries.length === 0) return null;

  const borderClass = accentColor ?? "border-slate-200 dark:border-slate-700";

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border overflow-hidden ${borderClass}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left
                   hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-xl">{icon}</span>}
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                {subtitle}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {allEntries.length} formula{allEntries.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-slate-100 dark:border-slate-700">
          <table className="w-full">
            <tbody>
              {regular.map(([key, value]) => (
                <TimeRow
                  key={key}
                  label={ZMAN_LABELS[key] ?? key}
                  value={value}
                  timezone={timezone}
                />
              ))}
            </tbody>
          </table>

          {motzaei.length > 0 && (
            <>
              <div className="px-5 pt-3 pb-1 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                  {subtitle ?? "Motzaei Shabbos"} — End Times
                </p>
              </div>
              <table className="w-full bg-slate-50 dark:bg-slate-900/20">
                <tbody>
                  {motzaei.map(([key, value]) => (
                    <TimeRow
                      key={key}
                      label={ZMAN_LABELS[key] ?? ZMAN_LABELS[key.replace("motzaei_", "")] ?? key}
                      value={value}
                      timezone={timezone}
                      small
                    />
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
}
