import React from "react";
import "./WeeklyForecast.css";

export default function WeeklyForecast({ weekly }) {
  if (!weekly || weekly.length === 0) return <p>No weekly data</p>;

  return (
    <div className="weekly-scroll">
      {weekly.map((d, i) => (
        <div className="week-item" key={i}>
          <p className="week-day">{d.day}</p>
          <div className="week-emoji">{d.emoji}</div>

          <p className="week-temp">
            {d.tempMax}° / {d.tempMin}°
          </p>
        </div>
      ))}
    </div>
  );
}
