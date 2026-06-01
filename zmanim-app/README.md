# Zmanim — All Halachic Times

A comprehensive Jewish halachic times (zmanim) calculator built with Next.js. It computes **~200 zmanim** for any location on earth using every major formula and opinion — the same NOAA solar algorithm and halachic calculations used by KosherJava / Chabad.org.

## Features

- 🔍 **Address search** with autocomplete (OpenStreetMap / Nominatim geocoding)
- 📍 **Use my location** — high-accuracy browser GPS with reverse geocoding
- 🏔️ **Elevation input** for precise sunrise/sunset adjustment
- 🌍 **Automatic timezone detection**
- 📅 **Any date** selection
- 📜 **All opinions:** GRA (Vilna Gaon), MGA (Magen Avraham), Baal HaTanya, Ateret Torah, Geonim (30+ degree variants), Yereim, Ahavat Shalom, Kol Eliyahu, Rabbeinu Tam, and more

### Categories

Astronomical twilight · Alos HaShachar · Misheyakir · Sunrise (Netz) · Sof Zman Shema · Sof Zman Tefila · Chatzos · Mincha Gedola · Mincha Ketana · Plag HaMincha · Sunset (Shkiah) · Bein HaShmashos · Tzait HaKochavim · Shaah Zmanis durations · Chametz times · Kidush Levana

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push this repo to GitHub (already done).
2. Go to [vercel.com/new](https://vercel.com/new) and import the `Zmanim` repository.
3. **Important:** set the **Root Directory** to `zmanim-app`.
4. Vercel auto-detects Next.js — click **Deploy**.
5. You'll get a live URL like `your-app.vercel.app`.

No environment variables are required.

## Tech

- [Next.js](https://nextjs.org) (App Router)
- [kosher-zmanim](https://www.npmjs.com/package/kosher-zmanim) — TypeScript port of [KosherJava](https://kosherjava.com)
- Tailwind CSS

## Notes

Zmanim are calculated server-side via the `/api/zmanim` route handler. All times are presented for educational purposes — consult a competent halachic authority for practical observance.
