import React from "react";
import "./WeatherDetails.css";

export default function WeatherDetails({ details={} }){
  if(!details) return null;
  return (
    <div className="wd card-glass" style={{marginTop:18}}>
      <h3 style={{margin:0,color:"#fff"}}>Detailed Insights</h3>
      <div className="wd-grid">
        <div className="wd-cell"><div className="wd-label">AQI</div><div className="wd-val">{details.aqi ?? "—"}</div></div>
        <div className="wd-cell"><div className="wd-label">PM2.5</div><div className="wd-val">{details.pm2_5 ?? "—"}</div></div>
        <div className="wd-cell"><div className="wd-label">PM10</div><div className="wd-val">{details.pm10 ?? "—"}</div></div>
        <div className="wd-cell"><div className="wd-label">O₃</div><div className="wd-val">{details.o3 ?? "—"}</div></div>
        <div className="wd-cell"><div className="wd-label">UV</div><div className="wd-val">{details.uv_index ?? "—"}</div></div>
        <div className="wd-cell"><div className="wd-label">Moon</div><div className="wd-val">{details.moon?.phaseName ?? "—"}</div></div>
      </div>
    </div>
  );
}
