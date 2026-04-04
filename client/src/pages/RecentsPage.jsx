import React from "react";
import { useNavigate } from "react-router-dom";
import RecentSearches from "../components/recent/RecentSearches";

export default function RecentsPage() {
  const navigate = useNavigate();

  function handleSelectCity(city) {
    if (!city) return;
    navigate(`/dashboard?city=${encodeURIComponent(city)}`);
  }

  return (
    <div className="recent-page-heading">
      <h2 style={{ marginBottom: 16 }}>Your Recent Searches</h2>
      <RecentSearches onSelectCity={handleSelectCity} />
    </div>
  );
}
