"use client";
import { useState, useEffect, useCallback } from "react";

const WEEKDAYS     = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HEB_WEEKDAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const HEB_MONTHS_HE = [
  "", "ניסן", "אייר", "סיון", "תמוז", "אב", "אלול",
  "תשרי", "חשון", "כסלו", "טבת", "שבט", "אדר", "אדר ב׳",
];

const HEB_NUM: Record<number, string> = {
  1:"א",2:"ב",3:"ג",4:"ד",5:"ה",6:"ו",7:"ז",8:"ח",9:"ט",
  10:"י",11:"יא",12:"יב",13:"יג",14:"יד",15:"טו",16:"טז",
  17:"יז",18:"יח",19:"יט",20:"כ",21:"כא",22:"כב",23:"כג",
  24:"כד",25:"כה",26:"כו",27:"כז",28:"כח",29:"כט",30:"ל",
};

interface DayData {
  day: number;
  hebrewDay: number;
  hebrewMonthName: string;
}

interface HebDayData {
  hebrewDay: number;
  gregorianDate: string;
  dayOfWeek: number;
}

interface Props {
  date: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CalendarPopup({ date, onChange }: Props) {
  const [open, setOpen]         = useState(false);
  const [hebrewMode, setHebrewMode] = useState(false);

  // Gregorian mode state
  const [viewYear, setViewYear]   = useState(() => parseInt(date.split("-")[0]));
  const [viewMonth, setViewMonth] = useState(() => parseInt(date.split("-")[1]) - 1);
  const [days, setDays]           = useState<DayData[]>([]);
  const [firstDow, setFirstDow]   = useState(0);

  // Hebrew mode state
  const [hebYear, setHebYear]     = useState(5786);
  const [hebMonth, setHebMonth]   = useState(7);
  const [hebDays, setHebDays]     = useState<HebDayData[]>([]);
  const [hebFirstDow, setHebFirstDow] = useState(0);
  const [hebIsLeap, setHebIsLeap] = useState(false);

  const [loading, setLoading] = useState(false);
  const today = localToday();

  // Keep gregorian view in sync when date prop changes from outside
  useEffect(() => {
    const [y, m] = date.split("-").map(Number);
    setViewYear(y); setViewMonth(m - 1);
  }, [date]);

  const fetchGregMonth = useCallback(async (year: number, month: number) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/convert-date?mode=month-grid&year=${year}&month=${month + 1}`);
      const j = await r.json();
      setDays(j.days ?? []);
      setFirstDow(j.firstDayOfWeek ?? 0);
    } catch {}
    setLoading(false);
  }, []);

  const fetchHebMonth = useCallback(async (year: number, month: number) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/convert-date?mode=hebrew-month-grid&year=${year}&month=${month}`);
      const j = await r.json();
      if (!j.error) {
        setHebDays(j.days ?? []);
        setHebFirstDow(j.firstDayOfWeek ?? 0);
        setHebIsLeap(j.isLeap ?? false);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (hebrewMode) fetchHebMonth(hebYear, hebMonth);
    else fetchGregMonth(viewYear, viewMonth);
  }, [open, hebrewMode, viewYear, viewMonth, hebYear, hebMonth, fetchGregMonth, fetchHebMonth]);

  const switchToHebrew = useCallback(async () => {
    try {
      const r = await fetch(`/api/convert-date?mode=g2h&date=${date}`);
      const j = await r.json();
      setHebYear(j.year);
      setHebMonth(j.month);
    } catch {}
    setHebrewMode(true);
  }, [date]);

  // Gregorian navigation
  const prevGregMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextGregMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  // Hebrew navigation
  const prevHebMonth = () => {
    let m = hebMonth, y = hebYear;
    if (m === 7)  { y--; m = 6; }
    else if (m === 1)  { m = hebIsLeap ? 13 : 12; }
    else if (m === 13) { m = 12; }
    else { m--; }
    setHebYear(y); setHebMonth(m);
  };
  const nextHebMonth = () => {
    let m = hebMonth, y = hebYear;
    if (m === 6)  { y++; m = 7; }
    else if (m === 12 && hebIsLeap) { m = 13; }
    else if (m === 12)              { m = 1; }
    else if (m === 13) { m = 1; }
    else { m++; }
    setHebYear(y); setHebMonth(m);
  };

  const selectGregDay = (day: number) => {
    const ds = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(ds); setOpen(false);
  };
  const selectHebDay = (gregorianDate: string) => {
    onChange(gregorianDate); setOpen(false);
  };

  // Build grids
  const gregGrid: (DayData | null)[] = [];
  for (let i = 0; i < firstDow; i++) gregGrid.push(null);
  gregGrid.push(...days);
  while (gregGrid.length % 7 !== 0) gregGrid.push(null);

  const hebGrid: (HebDayData | null)[] = [];
  for (let i = 0; i < hebFirstDow; i++) hebGrid.push(null);
  hebGrid.push(...hebDays);
  while (hebGrid.length % 7 !== 0) hebGrid.push(null);

  // Display button label
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

            {/* Mode toggle */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
              <span className="text-xs text-gray-500 font-medium">Calendar</span>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
                <button
                  onClick={() => hebrewMode && setHebrewMode(false)}
                  className={`px-3 py-1.5 transition-colors ${
                    !hebrewMode ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Gregorian
                </button>
                <button
                  onClick={() => !hebrewMode && switchToHebrew()}
                  className={`px-3 py-1.5 transition-colors border-l border-gray-200 ${
                    hebrewMode ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                  dir="rtl"
                >
                  עברי
                </button>
              </div>
            </div>

            {/* Month header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <button onClick={hebrewMode ? prevHebMonth : prevGregMonth}
                className="px-2 py-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors font-medium">
                &#8592;
              </button>
              <span className={`text-sm font-semibold text-gray-800 ${hebrewMode ? "font-['serif']" : ""}`}
                dir={hebrewMode ? "rtl" : "ltr"}>
                {hebrewMode
                  ? `${HEB_MONTHS_HE[hebMonth] ?? ""} ${hebYear}`
                  : `${MONTHS[viewMonth]} ${viewYear}`}
              </span>
              <button onClick={hebrewMode ? nextHebMonth : nextGregMonth}
                className="px-2 py-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors font-medium">
                &#8594;
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 px-2 pt-2 pb-1">
              {(hebrewMode ? HEB_WEEKDAYS : WEEKDAYS).map((d, i) => (
                <div key={i} className={`text-center text-[11px] font-semibold py-1
                  ${i === 6 ? "text-amber-600" : "text-gray-400"}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 px-2 pb-3 gap-y-0.5">
              {loading ? (
                <div className="col-span-7 py-6 text-center text-gray-400 text-sm">Loading...</div>
              ) : hebrewMode ? (
                hebGrid.map((cell, i) => {
                  if (!cell) return <div key={i} />;
                  const isSelected  = cell.gregorianDate === date;
                  const isTodayCell = cell.gregorianDate === today;
                  const isSat = cell.dayOfWeek === 6;
                  const gDay  = parseInt(cell.gregorianDate.split("-")[2]);

                  return (
                    <button key={i}
                      onClick={() => selectHebDay(cell.gregorianDate)}
                      className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors
                        ${isSelected  ? "bg-blue-600 text-white" :
                          isTodayCell ? "bg-blue-50 ring-1 ring-blue-400 text-blue-700" :
                          isSat       ? "text-amber-700 hover:bg-amber-50" :
                                        "text-gray-800 hover:bg-gray-100"}`}
                    >
                      <span className="text-sm font-medium leading-none" dir="rtl">
                        {HEB_NUM[cell.hebrewDay] ?? cell.hebrewDay}
                      </span>
                      <span className={`text-[9px] leading-none mt-0.5
                        ${isSelected ? "text-blue-200" : isSat && !isTodayCell ? "text-amber-500" : "text-gray-400"}`}>
                        {gDay}
                      </span>
                    </button>
                  );
                })
              ) : (
                gregGrid.map((cell, i) => {
                  if (!cell) return <div key={i} />;
                  const cellDate = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
                  const isSelected  = cellDate === date;
                  const isTodayCell = cellDate === today;
                  const dow = (firstDow + cell.day - 1) % 7;
                  const isSat = dow === 6;
                  const showMonth = cell.hebrewDay === 1;

                  return (
                    <button key={cell.day}
                      onClick={() => selectGregDay(cell.day)}
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
                })
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}
