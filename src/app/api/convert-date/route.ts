import { NextRequest, NextResponse } from "next/server";
import { JewishCalendar } from "kosher-zmanim";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JC = any;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");

  try {
    if (mode === "g2h") {
      const dateStr = searchParams.get("date") ?? "";
      const jc: JC = new JewishCalendar(new Date(dateStr + "T12:00:00Z"));
      return NextResponse.json({
        year:        jc.getJewishYear(),
        month:       jc.getJewishMonth(),
        day:         jc.getJewishDayOfMonth(),
        isLeapYear:  jc.isJewishLeapYear(),
        daysInMonth: jc.getDaysInJewishMonth(),
      });
    }

    if (mode === "h2g") {
      const year  = parseInt(searchParams.get("year")  ?? "");
      const month = parseInt(searchParams.get("month") ?? "");
      const day   = parseInt(searchParams.get("day")   ?? "");
      if (isNaN(year) || isNaN(month) || isNaN(day))
        return NextResponse.json({ error: "Invalid params" }, { status: 400 });
      const jc: JC = new JewishCalendar();
      jc.setJewishDate(year, month, day);
      const y = jc.getGregorianYear();
      const m = String(jc.getGregorianMonth() + 1).padStart(2, "0");
      const d = String(jc.getGregorianDayOfMonth()).padStart(2, "0");
      return NextResponse.json({ date: `${y}-${m}-${d}` });
    }

    if (mode === "days-in-month") {
      const year  = parseInt(searchParams.get("year")  ?? "");
      const month = parseInt(searchParams.get("month") ?? "");
      if (isNaN(year) || isNaN(month))
        return NextResponse.json({ error: "Invalid params" }, { status: 400 });
      const jc: JC = new JewishCalendar();
      jc.setJewishDate(year, month, 1);
      return NextResponse.json({
        days:       jc.getDaysInJewishMonth(),
        isLeapYear: jc.isJewishLeapYear(),
      });
    }

    if (mode === "month-grid") {
      const year  = parseInt(searchParams.get("year")  ?? "");
      const month = parseInt(searchParams.get("month") ?? ""); // 1-indexed
      if (isNaN(year) || isNaN(month))
        return NextResponse.json({ error: "Invalid params" }, { status: 400 });

      const mm = String(month).padStart(2, "0");
      const firstDay = new Date(`${year}-${mm}-01T12:00:00Z`);
      const daysInMonth = new Date(year, month, 0).getDate();
      const firstDayOfWeek = firstDay.getDay(); // 0=Sun

      const HEB_MONTHS = [
        "", "Nisan", "Iyar", "Sivan", "Tamuz", "Av", "Elul",
        "Tishrei", "Cheshvan", "Kislev", "Tevet", "Shevat", "Adar", "Adar II",
      ];

      const days = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const dd = String(d).padStart(2, "0");
        const jc: JC = new JewishCalendar(new Date(`${year}-${mm}-${dd}T12:00:00Z`));
        days.push({
          day:             d,
          hebrewDay:       jc.getJewishDayOfMonth(),
          hebrewMonth:     jc.getJewishMonth(),
          hebrewYear:      jc.getJewishYear(),
          hebrewMonthName: HEB_MONTHS[jc.getJewishMonth()] ?? "",
        });
      }
      return NextResponse.json({ days, firstDayOfWeek });
    }

    if (mode === "hebrew-month-grid") {
      const year  = parseInt(searchParams.get("year")  ?? "");
      const month = parseInt(searchParams.get("month") ?? "");
      if (isNaN(year) || isNaN(month))
        return NextResponse.json({ error: "Invalid params" }, { status: 400 });

      const jc: JC = new JewishCalendar();
      jc.setJewishDate(year, month, 1);
      const daysInMonth = jc.getDaysInJewishMonth();
      const isLeap = jc.isJewishLeapYear();

      const days = [];
      for (let d = 1; d <= daysInMonth; d++) {
        jc.setJewishDate(year, month, d);
        const gy = jc.getGregorianYear();
        const gm = String(jc.getGregorianMonth() + 1).padStart(2, "0");
        const gd = String(jc.getGregorianDayOfMonth()).padStart(2, "0");
        const gregorianDate = `${gy}-${gm}-${gd}`;
        const dow = new Date(gregorianDate + "T12:00:00Z").getDay(); // 0=Sun
        days.push({ hebrewDay: d, gregorianDate, dayOfWeek: dow });
      }

      const firstDayOfWeek = days[0]?.dayOfWeek ?? 0;
      return NextResponse.json({ days, firstDayOfWeek, daysInMonth, isLeap });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
