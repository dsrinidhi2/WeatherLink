import React, { useEffect, useState, useContext } from "react";
import { addFavourite, getFavourites, deleteFavourite, clearFavourites } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import DeleteConfirm from "../common/DeleteConfirm";
import "./Favourites.css";

export default function Favourites({ onSelectCity }) {
  const { user } = useContext(AuthContext);
  const [favs, setFavs] = useState([]);
  const [input, setInput] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteCity, setDeleteCity] = useState("");

  async function load() {
    if (!user) return;
    const res = await getFavourites();
    setFavs(res.data.favourites || []);
  }

  useEffect(() => {
    load();
  }, [user]);

  async function handleAdd() {
    if (!input) return;
    await addFavourite(input);
    setInput("");
    load();
  }

  function askDelete(city) {
    setDeleteCity(city);
    setConfirmOpen(true);
  }

  async function doDelete() {
    await deleteFavourite(deleteCity);
    setConfirmOpen(false);
    load();
  }

  return (
    <div className="fav-page-fix"> 
      <div className="fav-box">
        <h3>⭐ Favourites</h3>

        <div className="fav-add">
          <input
            value={input}
            placeholder="City"
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={handleAdd}>Add</button>
        </div>

        <ul className="fav-list">
          {favs.map((city, i) => (
            <li key={i} className="fav-row">
              <button className="fav-item" onClick={() => onSelectCity(city)}>
                {city}
              </button>
              <button className="delete-icon" onClick={() => askDelete(city)}>
                🗑️
              </button>
            </li>
          ))}
        </ul>

        {!favs.length && <div>No favourites yet</div>}

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
