import React from "react";
import "./HourlyForecast.css";

export default function HourlyForecast({ hourly }) {
  if (!hourly || hourly.length === 0) return <p>No hourly data</p>;

  return (
    <div className="hourly-container">
      {hourly.map((h, i) => (
        <div className="hour-card" key={i}>
          <div className="hour-time">
            {new Date(h.time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>

          <div className="hour-temp">{h.temperature}</div>

          <div className="hour-wind">
            {h.wind_speed_kmh != null ? `${h.wind_speed_kmh} km/h` : "--"}
          </div>

          <div className="hour-pop">{h.pop}% rain</div>
        </div>
      ))}
    </div>
  );
}
