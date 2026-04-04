// client/src/pages/Dashboard.jsx

import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

import {
  fetchWeatherForCity,
  addRecent,
  detectCityFromCoords,
} from "../services/api";

import HourlyForecast from "../components/HourlyForecast";
import WeeklyForecast from "../components/WeeklyForecast";
import Chatbot from "../components/Chatbot";

import getBackgroundForWeatherCode from "../utils/getBackgroundForWeatherCode";
import "./Dashboard.css";

// ⚡ Helper: parse temperature
function parseTemp(tempStr) {
  if (!tempStr && tempStr !== 0) return null;
  if (typeof tempStr === "number") return tempStr;
  const m = String(tempStr).match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

// ⚡ Helper: fallback emoji
function emojiFallback(id, isDay, tempC) {
  if (id == null) return "❔";

  if (!isDay) {
    if (id === 800) return "🌙";
    if (id > 800) return "🌙☁️";
    if (id >= 200 && id < 300) return "⛈️";
    if (id >= 300 && id < 600) return "🌧️";
    if (id >= 600 && id < 700) return "❄️";
    if (id >= 700 && id < 800) return "🌫️";
    return "🌙";
  }

  if (id === 800) return "☀️";
  if (id > 800) return tempC > 15 ? "⛅" : "☁️";
  if (id >= 200 && id < 300) return "⛈️";
  if (id >= 300 && id < 600) return "🌧️";
  if (id >= 600 && id < 700) return "❄️";
  if (id >= 700 && id < 800) return "🌫️";
  return "🌤️";
}

// *************************************************************
// ⭐ ADVANCED ASSISTANT TIPS (YOUR CUSTOM VERSION ADDED)
// *************************************************************
// *************************************************************
// ⭐ ADVANCED ASSISTANT TIPS (SMART NIGHT + DAY SYSTEM)
// *************************************************************
function synthesizeTips(data) {
  if (!data) return "";
  const tips = [];

  const temp = parseTemp(data.temperature);
  const humidity = parseFloat(data.details?.humidity);
  const rainPop = data.hourly?.[0]?.pop ?? 0;
  const wind = parseFloat(data.details?.wind_speed);
  const clouds = parseFloat(data.details?.clouds);

  const description = (data.description || "").toLowerCase();

  // Time-based logic
  const now = new Date();
  const hour = now.getHours();
  const isMorning = hour >= 6 && hour <= 11;
  const isNight = hour >= 19 || hour <= 5;

  // -------------------------------
  // 🌧 RAIN TIPS
  // -------------------------------
  if (rainPop >= 0.7) tips.push("🌧 Heavy rain expected — carry an umbrella.");
  else if (rainPop >= 0.3) tips.push("🌦 Light rain expected — keep an umbrella.");

  // -------------------------------
  // 🌬 WIND TIPS
  // -------------------------------
  if (wind >= 25) tips.push("🌬 Strong winds — avoid drying clothes on the terrace.");
  else if (wind >= 15) tips.push("🍃 Moderate wind — secure loose outdoor items.");

  // -------------------------------
  // ☀️ SUNSCREEN (MORNING ONLY)
  // -------------------------------
  if (isMorning && temp >= 26) {
    tips.push("🧴 Morning sunlight is strong — apply sunscreen before going out.");
  }

  // -------------------------------
  // 🌡 HEAT SAFETY
  // -------------------------------
  if (temp >= 35) tips.push("🥵 Very hot — drink plenty of water.");
  else if (temp >= 30) tips.push("🥤 Stay hydrated throughout the day.");

  // -------------------------------
  // ❄ COLD SAFETY
  // -------------------------------
  if (temp <= 18) tips.push("🧣 Cold weather — keep yourself warm to avoid flu.");

  // -------------------------------
  // ☁ CLOUDINESS
  // -------------------------------
  if (clouds >= 70) tips.push("☁️ Cloudy skies — temperature may feel cooler.");

  // -------------------------------
  // 👕 CLOTHES DRYING
  // -------------------------------
  if (rainPop >= 0.3 || wind >= 20) {
    tips.push("👕 If clothes are drying on terrace, bring them inside.");
  }

  // -------------------------------
  // 🌫 VISIBILITY IMPACT
  // -------------------------------
  const vis = data.details?.visibility;
  if (vis?.includes("km")) {
    const km = parseFloat(vis);
    if (km < 2) tips.push("⚠ Low visibility — drive carefully.");
  }

  // -------------------------------
  // 🌙 NIGHT-TIME HAZARD WARNINGS (NEW)
  // -------------------------------
  if (isNight) {

    // Haze, fog, mist → driving danger
    if (description.includes("haze") || description.includes("fog") || description.includes("mist")) {
      tips.push("🌫 Night haze — be extra careful while driving.");
    }

    // Rainy night
    if (rainPop >= 0.3) {
      tips.push("🌧 Roads may be slippery at night — drive slowly.");
    }

    // Windy night
    if (wind >= 20) {
      tips.push("🌬 Windy night — avoid going out unless necessary.");
    }

    // Cold night
    if (temp <= 20) {
      tips.push("❄ Cold night — keep yourself warm.");
    }
  }

  // -------------------------------
  // ⭐ Smart fallback when no tips
  // -------------------------------
  if (tips.length === 0) {
    if (isNight && description.includes("haze"))
      return "🌫 Night haze — be extra careful while driving.";

    if (isNight)
      return "🌙 Calm night — perfect time to relax indoors.";

    return "✨ Weather looks normal — have a great day!";
  }

  return [...new Set(tips)].join(" • ");
}

// *************************************************************
// ⭐ MAIN COMPONENT
// *************************************************************
export default function Dashboard() {
  const { token } = useContext(AuthContext);
  const location = useLocation();

  const [city, setCity] = useState("Bengaluru");
  const [data, setData] = useState(null);
  const [bg, setBg] = useState("/backgrounds/day-clear.gif");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ⭐ Load weather for city
  async function load(cityName = city) {
    try {
      setError("");
      setLoading(true);

      const res = await fetchWeatherForCity(cityName);
      const weather = res.data;

      if (!weather?.success) throw new Error(weather?.error || "City not found");

      setData(weather);
      setCity(cityName);

      const bgPath = getBackgroundForWeatherCode(
        weather.weather_code,
        weather.sunrise,
        weather.sunset
      );
      setBg(bgPath);

      localStorage.setItem("lastCity", cityName);

      if (token) {
        try {
          await addRecent(cityName);
        } catch {}
      }
    } catch (err) {
      setError(err?.message || "Failed to load weather.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  // ⭐ Load city from navigation/query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlCity = params.get("city");
    const stateCity = location.state?.city;
    const pickedCity = stateCity || urlCity;

    if (pickedCity) {
      setCity(pickedCity);
      load(pickedCity);
      return;
    }
  }, [location]);

  // ⭐ Initial load
  useEffect(() => {
    const last = localStorage.getItem("lastCity") || "Bengaluru";
    setCity(last);
    load(last);
  }, [token]);

  // ⭐ Geolocation auto-detect
  useEffect(() => {
    let cancelled = false;

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (cancelled) return;

        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          const res = await detectCityFromCoords(lat, lon);

          if (res.data?.success) {
            setCity(res.data.location);
            setData(res.data);

            setBg(
              getBackgroundForWeatherCode(
                res.data.weather_code,
                res.data.sunrise,
                res.data.sunset
              )
            );

            localStorage.setItem("lastCity", res.data.location);
          } else if (res.data?.location) {
            setCity(res.data.location);
            load(res.data.location);
          }
        } catch {}
      },
      (err) => console.log("GEO ERROR:", err),
      { maximumAge: 900000, timeout: 8000 }
    );

    return () => (cancelled = true);
  }, []);

  // ⭐ Derived weather info
  let isDay = true;
  if (data?.sunrise && data?.sunset) {
    const now = Date.now();
    isDay = now > data.sunrise * 1000 && now < data.sunset * 1000;
  }

  const tempC = parseTemp(data?.temperature);

  const mainEmoji =
    data?.hourly?.[0]?.emoji ??
    (data?.weather_code
      ? emojiFallback(data.weather_code, isDay, tempC)
      : "❔");

  const tipsText = synthesizeTips(data);

  // ⭐ UI
  return (
    <div className="dash-root" style={{ backgroundImage: `url(${bg})` }}>

      {/* ⭐ LOCKED LOGIN SCREEN */}
      {!token && (
        <div className="locked-screen">
          <div className="locked-card">
            <h2>You're not logged in</h2>
            <p>Please log in or create an account to access your dashboard.</p>

            <div className="locked-buttons">
              <a href="/login" className="locked-btn primary">Login</a>
              <a href="/register" className="locked-btn">Register</a>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ LOGGED IN → FULL DASHBOARD */}
      {token && (
        <div className="dash-overlay">

          {/* HEADER */}
          <div className="dash-header">
            <h1>Weather Dashboard</h1>

            <div className="search-row">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Search city..."
              />
              <button onClick={() => load()}>Search</button>
            </div>
          </div>

          <div className="side-panel"></div>

          <div className="dash-container">
            {loading && <div className="status">Loading...</div>}
            {error && <div className="status error">{error}</div>}

            {data && (
              <>
                {/* TOP ROW */}
                <div className="top-row">
                  <div className="location-block">
                    <h2>{data.location}</h2>
                    <p style={{ opacity: 0.8 }}>{data.description}</p>

                    {/* ⭐ SUNRISE & SUNSET ADDED HERE */}
                    <p style={{ marginTop: "8px", fontSize: "14px", opacity: 0.85 }}>
                      🌅 Sunrise: {data.sunrise ? new Date(data.sunrise * 1000)
                        .toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </p>

                    <p style={{ fontSize: "14px", opacity: 0.85 }}>
                      🌇 Sunset: {data.sunset ? new Date(data.sunset * 1000)
                        .toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </p>
                  </div>

                  <div className="temp-block">
                    <div className="emoji-large">{mainEmoji}</div>
                    <div className="temp-large">
                      <h1>{data.temperature}</h1>
                      {data.feels_like && <p>Feels like {data.feels_like}</p>}
                    </div>
                  </div>
                </div>

                {/* ⭐ ASSISTANT TIPS */}
                <div className="tips-row">
                  <h3>💡 Assistant Tip</h3>
                  <p>{tipsText || "No special tips."}</p>
                </div>

                <section>
                  <h2>Hourly Forecast</h2>
                  <HourlyForecast hourly={data.hourly || []} />
                </section>

                <section>
                  <h2>Weekly Forecast</h2>
                  <WeeklyForecast weekly={data.weekly || []} />
                </section>
              </>
            )}
          </div>

          <Chatbot city={city} weather={data || {}} />
        </div>
      )}
    </div>
  );
}
