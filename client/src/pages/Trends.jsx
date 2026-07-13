// client/src/pages/Trends.jsx
import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, CartesianGrid, Legend
} from "recharts";
import "./Trends.css";
import api from "../services/api";

function hourLabel(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function Trends() {
  const [city, setCity] = useState(localStorage.getItem("lastCity") || "Bengaluru");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* ---------------------------------------------------------
     UPDATED LOAD() — supports lat/lon also
  --------------------------------------------------------- */
  async function load(cityName = city, lat = null, lon = null) {
    setLoading(true);
    try {
      let q = "";

      if (lat && lon) {
        q = `/api/trends?lat=${lat}&lon=${lon}`;
      } else {
        q = `/api/trends?city=${encodeURIComponent(cityName)}`;
      }

      const res = await api.get(q);
      const json = res.data;

      if (!json || !json.success) {
        setData({ error: json?.error || "Failed to load trends" });
      } else {
        const hourly = (json.hourly || []).map(h => ({
          time: hourLabel(h.time),
          temp: h.tempC,
          humidity: h.humidity,
          pop: h.pop,
          wind: h.wind_kmh
        }));

        setData({
          city: json.city,
          avgTemp: json.avgTemp,
          commonCondition: json.commonCondition,
          hourly,
          daily: json.daily || []
        });
      }
    } catch (e) {
      console.error("TRENDS LOAD ERR", e);
      setData({ error: "Network error" });
    }
    setLoading(false);
  }

  /* ---------------------------------------------------------
     GEOLOCATION AUTO-DETECTION
  --------------------------------------------------------- */
  useEffect(() => {
    if (!navigator.geolocation) {
      load(city);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        load(null, lat, lon);  // call API with coordinates
      },
      (err) => {
        console.log("Geo error:", err);
        load(city); // fallback
      }
    );
  }, []);

  if (!data) {
    return (
      <div className="trends-root">
        <div className="trends-header">
          <h1>Weather Trends</h1>
          <div className="controls">
            <input value={city} onChange={(e)=>setCity(e.target.value)} />
            <button onClick={()=>load(city)}>Load</button>
            <div className="theme-toggle">
              <label className="switch">
                <input type="checkbox"
                  checked={theme === "light"}
                  onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                />
                <span className="slider" />
              </label>
              <span className="theme-label">{theme === "dark" ? "Dark" : "Light"}</span>
            </div>
          </div>
        </div>
        <p className="loading">Loading…</p>
      </div>
    );
  }

  return (
    <div className="trends-root">
      <div className="trends-header">
        <h1>Weather Trends</h1>

        <div className="controls">
          <input value={city} onChange={(e)=>setCity(e.target.value)} />
          <button onClick={()=>load(city)} className="load-btn">Load</button>

          <div className="theme-toggle">
            <label className="switch">
              <input type="checkbox"
                checked={theme === "light"}
                onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              />
              <span className="slider" />
            </label>
            <span className="theme-label">{theme === "dark" ? "Dark" : "Light"}</span>
          </div>
        </div>
      </div>

      {loading && <p className="loading">Refreshing…</p>}

      {data.error ? (
        <div className="trend-card error">{data.error}</div>
      ) : (
        <>
          <div className="trend-summary">
            <div className="summary-left">
              <h2>{data.city}</h2>
              <p><strong>Avg Temperature:</strong> {data.avgTemp != null ? `${data.avgTemp}°C` : "—"}</p>
              <p><strong>Common Condition:</strong> {data.commonCondition}</p>
            </div>

            <div className="summary-right">
              <div className="mini-card">
                <div className="mini-title">Humidity (next 24h)</div>
                <div className="mini-value">
                  {data.hourly?.length ? (data.hourly[0].humidity ?? "—") + "%" : "—"}
                </div>
              </div>

              <div className="mini-card">
                <div className="mini-title">Chance of rain</div>
                <div className="mini-value">
                  {data.hourly?.length ? (data.hourly[0].pop ?? "—") + "%" : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal carousel */}
          <div className="chart-scroll">

            {/* Temperature */}
            <div className="chart-card">
              <h3>Temperature (°C)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.hourly}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                  <XAxis dataKey="time" interval={0} tick={{ fontSize: 12 }} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="temp" stroke="#ff8c42" strokeWidth={3} dot={{ r:4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Humidity */}
            <div className="chart-card">
              <h3>Humidity (%)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.hourly}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                  <XAxis dataKey="time" interval={0} tick={{ fontSize: 12 }} />
                  <YAxis domain={[0,100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="humidity" stroke="#4da6ff" fill="#4da6ff33" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Precipitation */}
            <div className="chart-card">
              <h3>Precipitation Probability (%)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.hourly}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                  <XAxis dataKey="time" interval={0} tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="pop" fill="#5eead4" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Wind */}
            <div className="chart-card">
              <h3>Wind Speed (km/h)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.hourly}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                  <XAxis dataKey="time" interval={0} tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="wind" stroke="#a78bfa" fill="#a78bfa33" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Daily row */}
          <div className="daily-row">
            {data.daily?.map((d,i) => (
              <div key={i} className="daily-card">
                <div className="day">{new Date(d.date).toLocaleDateString([], { weekday: "short" })}</div>
                <div className="cond">{d.label}</div>
                <div className="temps">{d.tempMax}° / {d.tempMin}°</div>
              </div>
            ))}
          </div>

        </>
      )}
    </div>
  );
}
