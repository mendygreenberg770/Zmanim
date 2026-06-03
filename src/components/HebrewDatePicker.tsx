"use client";
import { useState, useEffect, useCallback } from "react";

const HEBREW_MONTHS = [
  "", "Nisan", "Iyar", "Sivan", "Tamuz", "Av", "Elul",
  "Tishrei", "Cheshvan", "Kislev", "Tevet", "Shevat", "Adar", "Adar II",
];

interface Props {
  date: string;           // YYYY-MM-DD (Gregorian)
  onChange: (date: string) => void;
}

export default function HebrewDatePicker({ date, onChange }: Props) {
  const [mode, setMode]       = useState<"greg" | "heb">("greg");
  const [hYear, setHYear]     = useState(5786);
  const [hMonth, setHMonth]   = useState(1);
  const [hDay, setHDay]       = useState(1);
  const [maxDays, setMaxDays] = useState(30);
  const [isLeap, setIsLeap]   = useState(false);
  const [display, setDisplay] = useState("");
  const [converting, setConverting] = useState(false);

  const loadFromGregorian = useCallback(async (d: string) => {
    try {
      const r = await fetch(`/api/convert-date?mode=g2h&date=${d}`);
      const j = await r.json();
      setHYear(j.year); setHMonth(j.month); setHDay(j.day);
      setMaxDays(j.daysInMonth); setIsLeap(j.isLeapYear);
      setDisplay(`${j.day} ${HEBREW_MONTHS[j.month] ?? ""} ${j.year}`);
    } catch {}
  }, []);

  useEffect(() => { loadFromGregorian(date); }, [date, loadFromGregorian]);

  useEffect(() => {
    if (mode !== "heb") return;
    fetch(`/api/convert-date?mode=days-in-month&year=${hYear}&month=${hMonth}`)
      .then(r => r.json())
      .then(j => {
        setMaxDays(j.days); setIsLeap(j.isLeapYear);
        if (hDay > j.days) setHDay(j.days);
      })
      .catch(() => {});
  }, [hYear, hMonth, mode]);

  const applyHebrew = async () => {
    setConverting(true);
    try {
      const r = await fetch(`/api/convert-date?mode=h2g&year=${hYear}&month=${hMonth}&day=${hDay}`);
      const j = await r.json();
      if (j.date) { onChange(j.date); setMode("greg"); }
    } catch {}
    setConverting(false);
  };

  if (mode === "greg") {
    return (
      <div className="flex items-center gap-2 text-sm">
        {display && <span className="text-gray-500">{display}</span>}
        <button
          onClick={() => setMode("heb")}
          className="text-blue-600 hover:text-blue-700 text-xs font-medium hover:underline underline-offset-2"
        >
          Hebrew date
        </button>
      </div>
    );
  }

  const maxMonths = isLeap ? 13 : 12;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={hMonth}
        onChange={e => setHMonth(parseInt(e.target.value))}
        className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {Array.from({ length: maxMonths }, (_, i) => i + 1).map(m => (
          <option key={m} value={m}>{HEBREW_MONTHS[m]}</option>
        ))}
      </select>
      <select
        value={hDay}
        onChange={e => setHDay(parseInt(e.target.value))}
        className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-800 bg-white w-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {Array.from({ length: maxDays }, (_, i) => i + 1).map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <select
        value={hYear}
        onChange={e => setHYear(parseInt(e.target.value))}
        className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {Array.from({ length: 26 }, (_, i) => 5775 + i).map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      <button
        onClick={applyHebrew}
        disabled={converting}
        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {converting ? "..." : "Go"}
      </button>
      <button
        onClick={() => setMode("greg")}
        className="px-2 py-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        Cancel
      </button>
    </div>
  );
}
