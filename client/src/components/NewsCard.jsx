import React from "react";

function NewsCard({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="card">
      <h2>📰 Local Alerts</h2>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default NewsCard;
