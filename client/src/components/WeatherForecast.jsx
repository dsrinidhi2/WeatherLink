import React from "react";
import "./WeeklyForecast.css";

export default function WeeklyForecast({ weekly=[] }){
  if(!weekly || weekly.length===0) return null;
  return (
    <div className="weekly-wrap">
      <h3>Weekly Forecast</h3>
      <div className="weekly-row">
        {weekly.map((w,i)=>(
          <div className="weekly-card card-glass" key={i}>
            <div className="weekly-day">{w.day}</div>
            <div className="weekly-emoji">{w.emoji}</div>
            <div className="weekly-temps">{w.max}° / {w.min}°</div>
          </div>
        ))}
      </div>
    </div>
  );
}
