"use client";

import { useState } from "react";
import { ZMAN_LABELS } from "@/lib/labels";

interface Props {
  title: string;
  data: Record<string, string | null>;
  timezone: string;
  defaultOpen?: boolean;
  subtitle?: string;
  accentColor?: string; // "amber" | "gray" | undefined
}

function formatTime(isoStr: string | null, timezone: string): string {
  if (!isoStr) return "—";
  try {
    return new Date(isoStr).toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
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
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <td className={`px-4 py-2.5 text-gray-700 ${small ? "text-xs" : "text-sm"}`}>
        {label}
      </td>
      <td className={`px-4 py-2.5 text-right font-mono tabular-nums ${
        small
          ? "text-xs text-blue-500"
          : "text-sm text-blue-600 font-semibold"
      }`}>
        {formatted}
      </td>
    </tr>
  );
}

export default function ZmanimSection({
  title, data, timezone, defaultOpen = false, subtitle, accentColor,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  const allEntries = Object.entries(data).filter(([, v]) => v !== null);
  const regular    = allEntries.filter(([k]) => !k.startsWith("motzaei_"));
  const motzaei    = allEntries.filter(([k]) =>  k.startsWith("motzaei_"));

  if (allEntries.length === 0) return null;

  const accentBorder =
    accentColor === "amber" ? "border-l-[3px] border-l-amber-400" :
    accentColor === "gray"  ? "border-l-[3px] border-l-gray-400"  : "";

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${accentBorder}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div>
          <h2 className="text-sm font-semibold text-gray-800 leading-tight">{title}</h2>
          {subtitle && (
            <p className="text-xs text-amber-700 font-medium mt-0.5">{subtitle}</p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">
            {allEntries.length} formula{allEntries.length !== 1 ? "s" : ""}
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-100">
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
              <div className="px-4 pt-3 pb-2 bg-amber-50 border-t border-amber-100">
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                  Shabbos End Times
                </p>
              </div>
              <table className="w-full bg-gray-50">
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
