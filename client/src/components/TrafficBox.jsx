// client/src/components/TrafficBox.jsx
import React from "react";
import "./TrafficBox.css";

export default function TrafficBox({ traffic }) {
  if (!traffic) return null;

  return (
    <div className="traffic-box">
      <h2>🚗 Traffic Update</h2>
      <p>{traffic}</p>
    </div>
  );
}
