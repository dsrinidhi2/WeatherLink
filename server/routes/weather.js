require("dotenv").config();
const express = require("express");
const axios = require("axios");
const router = express.Router();

const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY;
console.log("🔑 OPENWEATHER:", OPENWEATHER_KEY ? "OK" : "Missing");

// ---------- helpers ----------
const round = (v, d = 1) => (v == null ? null : +v.toFixed(d));
const mToKm = (m) => (m == null ? null : +(m / 1000).toFixed(1));

function degToCompass(num) {
  if (num == null) return null;
  const val = Math.floor(num / 22.5 + 0.5);
  return [
    "N","NNE","NE","ENE","E","ESE","SE","SSE",
    "S","SSW","SW","WSW","W","WNW","NW","NNW"
  ][val % 16];
}

function safeLog(err) {
  if (err?.response?.status) {
    console.log("HTTP ERR:", err.response.status, err.response.statusText, err.response?.data || "");
  } else {
    console.log("ERROR:", err?.message || err);
  }
}

// ---------- EMOJI ENGINE ----------
const E = (s) => s + "\uFE0F";

function emojiFromCode(code, timestampMs = null, sunrise = null, sunset = null) {
  if (code === null || code === undefined) return E("❓");

  let isDay = true;
  if (timestampMs && sunrise && sunset) {
    isDay = timestampMs > sunrise * 1000 && timestampMs < sunset * 1000;
  }

  if (code >= 200 && code <= 232) return E("⛈️");
  if (code >= 300 && code <= 321) return E("🌦️");
  if (code >= 500 && code <= 531) return E("🌧️");
  if (code >= 600 && code <= 622) return E("❄️");
  if (code >= 701 && code <= 781) return E("🌫️");

  if (code === 800) return isDay ? E("☀️") : E("🌙");
  if (code === 801) return isDay ? E("🌤️") : E("☁️");
  if (code === 802) return E("⛅");
  if (code === 803) return E("🌥️");
  if (code === 804) return E("☁️");

  if (code === 0) return isDay ? E("☀️") : E("🌙");
  if (code === 1) return isDay ? E("🌤️") : E("☁️");
  if (code === 2) return E("⛅");
  if (code === 3) return E("☁️");

  if (code === 45 || code === 48) return E("🌫️");
  if (code >= 51 && code <= 57) return E("🌦️");
  if (code >= 61 && code <= 67) return E("🌧️");
  if (code >= 71 && code <= 77) return E("❄️");
  if (code >= 80 && code <= 82) return E("🌧️");
  if (code >= 85 && code <= 86) return E("❄️");
  if (code >= 95) return E("⛈️");

  return E("❓");
}

function emojiWeekly(code) {
  if (code == null) return E("❓");

  if (code >= 200 && code <= 232) return E("⛈️");
  if (code >= 300 && code <= 321) return E("🌦️");
  if (code >= 500 && code <= 531) return E("🌧️");
  if (code >= 600 && code <= 622) return E("❄️");
  if (code >= 700 && code <= 771) return E("🌫️");

  if (code === 800) return E("☀️");
  if (code === 801) return E("🌤️");
  if (code === 802) return E("⛅");
  if (code === 803) return E("🌥️");
  if (code === 804) return E("☁️");

  if (code === 0) return E("☀️");
  if (code === 1) return E("🌤️");
  if (code === 2) return E("⛅");
  if (code === 3) return E("☁️");

  return E("❓");
}

// ---------- FETCH CURRENT ----------
async function fetchOpenWeatherCurrent(lat, lon) {
  try {
    const url =
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_KEY}`;
    const res = await axios.get(url);
    const d = res.data;

    return {
      temp: d.main.temp,
      feels_like: d.main.feels_like,
      humidity: d.main.humidity,
      wind_kmh: d.wind.speed * 3.6,
      weather_code: d.weather?.[0]?.id,
      description: d.weather?.[0]?.description,
      visibility: d.visibility,
      sunrise: d.sys?.sunrise,
      sunset: d.sys?.sunset,
      dt: d.dt,
      raw: d
    };
  } catch (e) {
    safeLog(e);
    return null;
  }
}

// ---------- FETCH FORECAST ----------
async function fetchOpenMeteoForecast(lat, lon) {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&hourly=temperature_2m,weathercode,precipitation_probability,windspeed_10m` +
      `&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

    const res = await axios.get(url);
    return res.data;
  } catch (e) {
    safeLog(e);
    return null;
  }
}

// ---------- FETCH AIR QUALITY (NEW) ----------
async function fetchAirQuality(lat, lon) {
  try {
    const url =
      `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}`;
    const res = await axios.get(url);

    const a = res.data?.list?.[0];
    if (!a) return null;

    return {
      aqi: a.main?.aqi || null,
      components: {
        pm2_5: a.components?.pm2_5 ?? null,
        pm10: a.components?.pm10 ?? null,
        o3: a.components?.o3 ?? null,
        no2: a.components?.no2 ?? null,
        so2: a.components?.so2 ?? null,
        co: a.components?.co ?? null,
      }
    };
  } catch (e) {
    safeLog(e);
    return null;
  }
}

// ---------- NEAREST HOUR ----------
function nearestHourIndex(hourlyTimesIso) {
  const now = Date.now();
  let best = 0;
  let diffBest = Infinity;

  for (let i = 0; i < hourlyTimesIso.length; i++) {
    const t = new Date(hourlyTimesIso[i]).getTime();
    const diff = Math.abs(t - now);
    if (diff < diffBest) {
      diffBest = diff;
      best = i;
    }
  }
  return best;
}

// ---------- MAIN API ----------
router.get("/:city", async (req, res) => {
  try {
    const city = req.params.city;

    // GEO
    const geoUrl =
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}` +
      `&limit=1&appid=${OPENWEATHER_KEY}`;

    const g = await axios.get(geoUrl);
    if (!g.data || !g.data.length)
      return res.json({ success: false, error: "City not found" });

    const loc = g.data[0];
    const lat = loc.lat;
    const lon = loc.lon;

    const locationName =
      `${loc.name}${loc.state ? ", " + loc.state : ""}, ${loc.country}`;

    // PARALLEL FETCH (ADDED AQ)
    const [ow, om, aq] = await Promise.all([
      fetchOpenWeatherCurrent(lat, lon),
      fetchOpenMeteoForecast(lat, lon),
      fetchAirQuality(lat, lon) // NEW
    ]);

    // CURRENT VALUES
    let currentTemp = ow?.temp ?? null;
    let currentFeels = ow?.feels_like ?? null;
    let currentCode = ow?.weather_code ?? null;

    let sunrise = ow?.sunrise ?? null;
    let sunset = ow?.sunset ?? null;

    // temp from openmeteo fallback
    if (om?.hourly?.time) {
      const idx = nearestHourIndex(om.hourly.time);

      if (currentTemp == null)
        currentTemp = om.hourly.temperature_2m[idx];

      if (currentFeels == null)
        currentFeels = om.hourly.temperature_2m[idx];

      if (currentCode == null)
        currentCode = om.hourly.weathercode[idx];
    }

    const displayTemp = `${round(currentTemp)}°C`;
    const displayFeels = `${round(currentFeels)}°C`;

    // HOURLY
    const hourly = [];
    if (om?.hourly?.time) {
      const L = Math.min(24, om.hourly.time.length);
      for (let i = 0; i < L; i++) {
        const iso = om.hourly.time[i];
        const ts = new Date(iso).getTime();
        const code = om.hourly.weathercode[i];

        hourly.push({
          time: iso,
          temperature: `${Math.round(om.hourly.temperature_2m[i])}°C`,
          tempC: round(om.hourly.temperature_2m[i]),
          emoji: emojiFromCode(code, ts, sunrise, sunset),
          pop: om.hourly.precipitation_probability?.[i] ?? 0,
          weatherId: code,
          wind_speed_kmh: om.hourly.windspeed_10m?.[i]
            ? Math.round(om.hourly.windspeed_10m[i] * 3.6)
            : null
        });
      }
    }

    // WEEKLY
    const weekly = [];
    if (om?.daily?.time) {
      for (let i = 0; i < Math.min(7, om.daily.time.length); i++) {
        weekly.push({
          date: om.daily.time[i],
          day: new Date(om.daily.time[i]).toLocaleDateString("en-US", {
            weekday: "short",
            timeZone: om.timezone || "UTC",
          }),
          tempMax: Math.round(om.daily.temperature_2m_max[i]),
          tempMin: Math.round(om.daily.temperature_2m_min[i]),
          weatherId: om.daily.weathercode[i],
          emoji: emojiWeekly(om.daily.weathercode[i]),
        });
      }
    }

    // DETAILS
    const details = {
      pressure_hpa: ow?.raw?.main?.pressure
        ? `${ow.raw.main.pressure} hPa`
        : null,
      humidity: ow?.raw?.main?.humidity
        ? `${ow.raw.main.humidity}%`
        : null,
      visibility: ow?.visibility
        ? `${mToKm(ow.visibility)} km`
        : null,
      clouds: ow?.raw?.clouds?.all != null
        ? `${ow.raw.clouds.all}%`
        : null,
      feels_like: displayFeels,
      wind_speed: ow
        ? `${Math.round(ow.wind_kmh)} km/h`
        : null,
      wind_dir: ow?.raw?.wind?.deg
        ? degToCompass(ow.raw.wind.deg)
        : null,
      sunrise,
      sunset
    };

    // FINAL RESPONSE (AQ ADDED)
    return res.json({
      success: true,
      location: locationName,
      latitude: lat,
      longitude: lon,
      temperature: displayTemp,
      feels_like: displayFeels,
      weather_code: currentCode,
      description: ow?.description ?? "",
      hourly,
      weekly,
      details,
      sunrise,
      sunset,
      air: aq || null   // NEW
    });

  } catch (err) {
    safeLog(err);
    return res.json({ success: false, error: "Weather API failed" });
  }
});

// GEO route
router.get("/geo/:lat/:lon", async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const url =
      `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}` +
      `&limit=1&appid=${OPENWEATHER_KEY}`;

    const g = await axios.get(url);
    if (!g.data || !g.data.length)
      return res.json({ success: false, error: "Location not found" });

    const city = g.data[0].name;
    return res.redirect(302, `/api/weather/${encodeURIComponent(city)}`);

  } catch (err) {
    safeLog(err);
    return res.json({ success: false, error: "Failed to detect city" });
  }
});

module.exports = router;
