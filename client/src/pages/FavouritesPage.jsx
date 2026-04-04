import React from "react";
import { useNavigate } from "react-router-dom";
import Favourites from "../components/fav/Favourites";

export default function FavouritesPage() {
  const navigate = useNavigate();

  function handleSelectCity(city) {
    if (!city) return;
    navigate(`/dashboard?city=${encodeURIComponent(city)}`);
  }

  return (
    <div className="fav-page-heading">
      <h2 style={{ marginBottom: 16 }}>Your Favourite Cities</h2>
      <Favourites onSelectCity={handleSelectCity} />
    </div>
  );
}
