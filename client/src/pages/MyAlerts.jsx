import React, { useEffect, useState } from "react";
import { getExclusiveAlerts, createAlert, markAlertRead, deleteAlert } from "../services/api";
import "./MyAlerts.css";

export default function MyAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await getExclusiveAlerts();
        if (cancelled) return;
        setAlerts(res.data.alerts || []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function newAlert() {
    const title = prompt("Title for exclusive alert:");
    if (!title) return;
    const body = prompt("Message:");
    try {
      await createAlert({ title, body, exclusive: true });
      // refresh
      const res = await getExclusiveAlerts();
      setAlerts(res.data.alerts || []);
    } catch (e) {
      console.error(e);
      alert("Failed");
    }
  }

  async function toggleRead(a) {
    try {
      await markAlertRead(a._id, !a.read);
      const res = await getExclusiveAlerts();
      setAlerts(res.data.alerts || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function doDelete(a) {
    if (!confirm("Delete this alert?")) return;
    try {
      await deleteAlert(a._id);
      const res = await getExclusiveAlerts();
      setAlerts(res.data.alerts || []);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="myalerts-root">
      <h1>🔔 My Exclusive Alerts</h1>
      <p>Personal alerts for you only (bell).</p>
      <button className="btn" onClick={newAlert}>Create Exclusive Alert</button>

      {loading ? <p>Loading...</p> : (
        <ul className="alerts-list">
          {alerts.map((a) => (
            <li key={a._id} className={a.read ? "read" : "unread"}>
              <div>
                <strong>{a.title}</strong>
                <div className="muted small">{a.body}</div>
                <div className="muted tiny">{new Date(a.createdAt).toLocaleString()}</div>
              </div>
              <div className="actions">
                <button onClick={() => toggleRead(a)}>{a.read ? "Mark unread" : "Mark read"}</button>
                <button onClick={() => doDelete(a)}>Delete</button>
              </div>
            </li>
          ))}
          {!alerts.length && <div className="muted">No exclusive alerts yet.</div>}
        </ul>
      )}
    </div>
  );
}
