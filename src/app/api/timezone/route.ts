import { NextRequest, NextResponse } from "next/server";
import { find } from "geo-tz";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");

  if (isNaN(lat) || isNaN(lng))
    return NextResponse.json({ error: "Invalid lat/lng" }, { status: 400 });

  const results = find(lat, lng);
  const timezone = results[0] ?? "UTC";
  return NextResponse.json({ timezone });
}
