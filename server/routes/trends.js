// server/routes/trends.js
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const router = express.Router();

const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY;

// simple round
const round = (v) => (v == null ? null : Math.round(v));

/* WEATHER LABEL FIX */
function labelFromCode(code) {
  code = Number(code);
  if (code === 0) return "Clear";
  if (code === 1) return "Mainly Clear";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain Showers";
  if (code >= 85 && code <= 86) return "Snow Showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Unknown";
}

/* ---------------------------------------------------
   Accept BOTH city AND lat/lon
--------------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    let { city, lat, lon } = req.query;

    /* ============================
       1) If lat/lon given → use DIRECT
       ============================ */
    let locationName = "";

    if (lat && lon) {
      // reverse geo for proper name
      const revUrl =
        `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_KEY}`;

      const rev = await axios.get(revUrl);

      if (!rev.data || !rev.data.length)
        return res.json({ success: false, error: "Invalid coordinates" });

      const place = rev.data[0];
      locationName = `${place.name}, ${place.country}`;
    }

    /* ============================
       2) If city given → normal geo
       ============================ */
    else {
      city = city || "Bengaluru";

      const geoURL =
        `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHER_KEY}`;

      const g = await axios.get(geoURL);
      if (!g.data || !g.data.length)
        return res.json({ success: false, error: "City not found" });

      const loc = g.data[0];
      lat = loc.lat;
      lon = loc.lon;
      locationName = `${loc.name}${loc.state ? ", " + loc.state : ""}, ${loc.country}`;
    }

    // OPEN-METEO FORECAST
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&hourly=temperature_2m,relativehumidity_2m,weathercode,precipitation_probability,windspeed_10m` +
      `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
      `&timezone=auto`;

    const wx = await axios.get(url);
    const h = wx.data.hourly;
    const d = wx.data.daily;

    /* hourly */
    const hourly = [];
    if (h?.time) {
      for (let i = 0; i < h.time.length; i++) {
        hourly.push({
          time: h.time[i],
          tempC: round(h.temperature_2m[i]),
          humidity: h.relativehumidity_2m?.[i] ?? null,
          pop: h.precipitation_probability?.[i] ?? null,
          wind_kmh: h.windspeed_10m?.[i] ?? null,
          code: h.weathercode?.[i] ?? null,
          label: labelFromCode(h.weathercode?.[i])
        });
      }
    }

    /* daily */
    const daily = [];
    if (d?.time) {
      for (let i = 0; i < d.time.length; i++) {
        daily.push({
          date: d.time[i],
          tempMax: round(d.temperature_2m_max[i]),
          tempMin: round(d.temperature_2m_min[i]),
          label: labelFromCode(d.weathercode[i]),
        });
      }
    }

    const avgTemp =
      hourly.length > 0
        ? round(hourly.reduce((a, b) => a + (b.tempC || 0), 0) / hourly.length)
        : null;

    const freq = {};
    for (const h1 of hourly) freq[h1.code] = (freq[h1.code] || 0) + 1;

    const commonCode = Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0];

    return res.json({
      success: true,
      city: locationName,
      avgTemp,
      commonCondition: labelFromCode(commonCode),
      hourly,
      daily,
    });

  } catch (err) {
    console.log("TRENDS ERR:", err.message);
    return res.json({ success: false, error: "Server failed" });
  }
});

module.exports = router;
