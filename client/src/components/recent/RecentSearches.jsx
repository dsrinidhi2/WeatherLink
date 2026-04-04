import React, { useEffect, useState, useContext } from "react";
import { getRecents, deleteRecent, clearRecents } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import DeleteConfirm from "../common/DeleteConfirm";
import "./RecentSearches.css";

export default function RecentSearches({ onSelectCity }) {
  const { user } = useContext(AuthContext);
  const [recents, setRecents] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteCity, setDeleteCity] = useState("");

  async function load() {
    if (!user) return;
    const res = await getRecents();
    setRecents(res.data.recents || []);
  }

  useEffect(() => {
    load();
  }, [user]);

  function askDelete(city) {
    setDeleteCity(city);
    setConfirmOpen(true);
  }

  async function doDelete() {
    await deleteRecent(deleteCity);
    setConfirmOpen(false);
    load();
  }

  return (
    <div className="recent-page-fix">
      <div className="recent-box">
        <h3>🕑 Recent Searches</h3>

        <ul className="recent-list">
          {recents.map((r, i) => (
            <li key={i} className="recent-row">
              <button className="recent-item" onClick={() => onSelectCity(r.name)}>
                {r.name}
              </button>
              <button className="delete-icon" onClick={() => askDelete(r.name)}>
                🗑️
              </button>
            </li>
          ))}
        </ul>

        {!recents.length && <div>No recent searches</div>}

        <DeleteConfirm
          open={confirmOpen}
          city={deleteCity}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={doDelete}
        />
      </div>
    </div>
  );
}
