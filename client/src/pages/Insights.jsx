// client/src/pages/Insights.jsx
import React, { useState } from "react";
import { fetchWeatherForCity } from "../services/api";
import "./Insights.css";

export default function Insights() {
  const [city, setCity] = useState("Bengaluru");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load(cityName = city) {
    try {
      setLoading(true);
      setError("");

      const response = await fetchWeatherForCity(cityName);
      const res = response.data;

      if (!res || res.success !== true)
        throw new Error(res?.error || "No data");

      setData(res);
    } catch (err) {
      console.error(err);
      setError("Failed to load insights");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="insights-root">
      <h1>Weather Insights</h1>

      <div className="search-row">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city..."
        />
        <button onClick={() => load()}>Load</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="err">{error}</p>}

      {data && (
        <div className="insights-grid">

          {/* LOCATION CARD */}
          <div className="card">
            <h2>📍 Location</h2>
            <p><strong>{data.location}</strong></p>
            <p>{data.description}</p>
          </div>

          {/* CURRENT CONDITIONS CARD */}
          <div className="card">
            <h2>🌤 Current Conditions</h2>
            <p>Temperature: <strong>{data.temperature}</strong></p>
            <p>Feels Like: <strong>{data.feels_like}</strong></p>
          </div>

          {/* WIND CARD */}
          <div className="card">
            <h2>💨 Wind</h2>
            <p>Speed: <strong>{data.details?.wind_speed || "No data"}</strong></p>
            <p>Direction: <strong>{data.details?.wind_dir || "No data"}</strong></p>
          </div>

          {/* ATMOSPHERE CARD */}
          <div className="card">
            <h2>☁️ Atmosphere</h2>
            <p>Pressure: <strong>{data.details?.pressure_hpa || "No data"}</strong></p>
            <p>Visibility: <strong>{data.details?.visibility || "No data"}</strong></p>
            <p>Humidity: <strong>{data.details?.humidity || "No data"}</strong></p>
            <p>Clouds: <strong>{data.details?.clouds || "No data"}</strong></p>
          </div>

          {/* AIR QUALITY CARD */}
          <div className="card">
            <h2>🧪 Air Quality</h2>
            {data.air ? (
              <>
                <p>AQI: <strong>{data.air.aqi}</strong></p>
                <p>PM2.5: <strong>{data.air.components.pm2_5}</strong></p>
                <p>PM10: <strong>{data.air.components.pm10}</strong></p>
                <p>Ozone (O₃): <strong>{data.air.components.o3}</strong></p>
                <p>NO₂: <strong>{data.air.components.no2}</strong></p>
                <p>SO₂: <strong>{data.air.components.so2}</strong></p>
              </>
            ) : (
              <p>No air quality data</p>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
