import React from "react";
import "./WeeklyForecast.css";

export default function WeeklyForecast({ weekly }) {
  if (!weekly || weekly.length === 0) return <p>No weekly data</p>;

  return (
    <div className="weekly-container">
      {weekly.map((w, i) => (
        <div className="week-card" key={i}>
          <div className="week-day">{w.day}</div>

          <div className="week-temps">
            <span className="max">{w.tempMax}°C</span>
            <span className="min">{w.tempMin}°C</span>
          </div>
        </div>
      ))}
    </div>
  );
}
