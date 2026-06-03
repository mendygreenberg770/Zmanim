"use client";
import { useState, useEffect, useCallback } from "react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface DayData {
  day: number;
  hebrewDay: number;
  hebrewMonthName: string;
}

interface Props {
  date: string;  // YYYY-MM-DD
  onChange: (date: string) => void;
}

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CalendarPopup({ date, onChange }: Props) {
  const [open, setOpen]         = useState(false);
  const [viewYear, setViewYear] = useState(() => parseInt(date.split("-")[0]));
  const [viewMonth, setViewMonth] = useState(() => parseInt(date.split("-")[1]) - 1);
  const [days, setDays]         = useState<DayData[]>([]);
  const [firstDow, setFirstDow] = useState(0);
  const [loading, setLoading]   = useState(false);
  const today = localToday();

  // Keep view in sync when date prop changes from outside
  useEffect(() => {
    const [y, m] = date.split("-").map(Number);
    setViewYear(y); setViewMonth(m - 1);
  }, [date]);

  const fetchMonth = useCallback(async (year: number, month: number) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/convert-date?mode=month-grid&year=${year}&month=${month + 1}`);
      const j = await r.json();
      setDays(j.days ?? []);
      setFirstDow(j.firstDayOfWeek ?? 0);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) fetchMonth(viewYear, viewMonth);
  }, [open, viewYear, viewMonth, fetchMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const selectDay = (day: number) => {
    const ds = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(ds);
    setOpen(false);
  };

  // Build padded grid (null = empty cell)
  const grid: (DayData | null)[] = [];
  for (let i = 0; i < firstDow; i++) grid.push(null);
  grid.push(...days);
  while (grid.length % 7 !== 0) grid.push(null);

  // Display the selected date in the button
  const [selY, selM, selD] = date.split("-").map(Number);
  const displayLabel = new Date(selY, selM - 1, selD).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white
                   text-gray-900 text-sm hover:bg-gray-50 transition-colors
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {displayLabel}
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-xl border border-gray-200 shadow-xl w-72 select-none">

            {/* Month header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <button onClick={prevMonth}
                className="px-2 py-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors font-medium">
                &#8592;
              </button>
              <span className="text-sm font-semibold text-gray-800">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button onClick={nextMonth}
                className="px-2 py-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors font-medium">
                &#8594;
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 px-2 pt-2 pb-1">
              {WEEKDAYS.map(d => (
                <div key={d} className={`text-center text-[11px] font-semibold py-1
                  ${d === "Sat" ? "text-amber-600" : "text-gray-400"}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 px-2 pb-3 gap-y-0.5">
              {loading ? (
                <div className="col-span-7 py-6 text-center text-gray-400 text-sm">Loading...</div>
              ) : grid.map((cell, i) => {
                if (!cell) return <div key={i} />;

                const cellDate = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
                const isSelected  = cellDate === date;
                const isTodayCell = cellDate === today;
                const dow = (firstDow + cell.day - 1) % 7;
                const isSat = dow === 6;
                const showMonth = cell.hebrewDay === 1; // start of Hebrew month

                return (
                  <button key={cell.day}
                    onClick={() => selectDay(cell.day)}
                    className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors
                      ${isSelected  ? "bg-blue-600 text-white" :
                        isTodayCell ? "bg-blue-50 ring-1 ring-blue-400 text-blue-700" :
                        isSat       ? "text-amber-700 hover:bg-amber-50" :
                                      "text-gray-800 hover:bg-gray-100"}`}
                  >
                    <span className="text-sm font-medium leading-none">{cell.day}</span>
                    <span className={`text-[9px] leading-none mt-0.5
                      ${isSelected ? "text-blue-200" : isSat && !isTodayCell ? "text-amber-500" : "text-gray-400"}`}>
                      {showMonth ? `${cell.hebrewMonthName.slice(0, 3)} ` : ""}
                      {cell.hebrewDay}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        </>
      )}
    </div>
  );
}
