import React from "react";

function TrafficCard({ data }) {
  if (!data) return null;

  return (
    <div className="card">
      <h2>🚗 Traffic Update</h2>
      <p>{data}</p>
    </div>
  );
}

export default TrafficCard;
