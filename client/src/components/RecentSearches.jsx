import React, { useEffect, useState } from "react";

export default function RecentSearches({ onSelectCity }) {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadRecent() {
    setLoading(true);
    try {
      const res = await fetch("https://weatherlink.onrender.com/...");
      const data = await res.json();
      setRecent(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load recent searches", err);
      setRecent([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadRecent();
    // refresh every 60 seconds so UI stays updated while you test
    const id = setInterval(loadRecent, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      width: "300px",
      borderRadius: "10px",
      padding: "12px",
      boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
      background: "rgba(255,255,255,0.95)"
    }}>
      <h3 style={{ margin: "0 0 8px 0" }}>Recent searches</h3>

      {loading && <div style={{fontSize:14, color:"#666"}}>Loading…</div>}

      {!loading && recent.length === 0 && (
        <div style={{ fontSize: 13, color: "#777" }}>No recent searches yet.</div>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {recent.map((c, i) => (
          <li key={i} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 6px",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            cursor: "pointer"
          }}
            onClick={() => onSelectCity(typeof c.name === "string" ? c.name.split(",")[0] : c.name)}
          >
            <div>
              <div style={{ fontWeight: 700 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "#444" }}>{c.temperature}</div>
            </div>
            <div style={{ fontSize: 12, color: "#888" }}>
              {new Date(c.date).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
