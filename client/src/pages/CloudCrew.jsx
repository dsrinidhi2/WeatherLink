import React, { useEffect, useState, useContext } from "react";
import {
  getContacts,
  addContact,
  deleteContact,
  createAlert,
  getCloudCrewAlerts,
} from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "./CloudCrew.css";

export default function CloudCrew() {
  const { user } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: "", relation: "", city: "", phone: "", email: "" });
  const [alerts, setAlerts] = useState([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [c, a] = await Promise.all([getContacts(), getCloudCrewAlerts()]);
        if (cancelled) return;
        setContacts(c.data.contacts || []);
        setAlerts(a.data.alerts || []);
      } catch (e) {
        console.error(e);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function handleAddContact(e) {
    e.preventDefault();
    if (!form.name) return alert("Name required");
    try {
      const res = await addContact(form);
      setContacts((s) => [res.data.contact, ...s]);
      setForm({ name: "", relation: "", city: "", phone: "", email: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to add");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete contact?")) return;
    try {
      await deleteContact(id);
      setContacts((s) => s.filter((c) => c._id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  async function sendAlertToCloudCrew() {
    const title = prompt("Alert title (short):");
    if (!title) return;
    const body = prompt("Short message:");
    setCreating(true);
    try {
      await createAlert({ title, body, forCloudCrew: true, exclusive: false });
      alert("Alert created and sent to CloudCrew (saved + emailed).");
      const a = await getCloudCrewAlerts();
      setAlerts(a.data.alerts || []);
    } catch (e) {
      console.error(e);
      alert("Failed to send");
    }
    setCreating(false);
  }

  return (
    <div className="cloudcrew-root">
      <h1>☁️ CloudCrew Alerts</h1>
      <p>Alert zone for friends & family. Send quick weather alerts to your circle.</p>

      <div className="cc-section">
        <div className="cc-left">
          <h3>Your Contacts</h3>
          <form onSubmit={handleAddContact} className="cc-form">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Relation (Mom, Dad...)" value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} />
            <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input placeholder="Email (for alerts)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <button type="submit">Add Contact</button>
          </form>

          <ul className="cc-list">
            {contacts.map((c) => (
              <li key={c._id}>
                <div>
                  <strong>{c.name}</strong> <span className="muted">({c.relation})</span>
                  <div className="muted small">
                    {c.city}{c.phone ? " • " + c.phone : ""}{c.email ? " • " + c.email : ""}
                  </div>
                </div>
                <div>
                  <button className="btn-small" onClick={() => handleDelete(c._id)}>Delete</button>
                </div>
              </li>
            ))}
            {!contacts.length && <div className="muted">No contacts yet — add some people!</div>}
          </ul>
        </div>

        <div className="cc-right">
          <h3>Recent CloudCrew Alerts</h3>
          <button className="btn" onClick={sendAlertToCloudCrew} disabled={creating}>{creating ? "Sending..." : "Send Alert to CloudCrew"}</button>
          <ul className="alerts-list">
            {alerts.map((a) => (
              <li key={a._id}>
                <strong>{a.title}</strong>
                <div className="muted small">{a.body}</div>
                <div className="muted small">{new Date(a.createdAt).toLocaleString()}</div>
              </li>
            ))}
            {!alerts.length && <div className="muted">No cloudcrew alerts yet.</div>}
          </ul>
        </div>
      </div>
    </div>
  );
}