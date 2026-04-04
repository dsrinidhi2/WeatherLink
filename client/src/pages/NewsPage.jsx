// client/src/pages/NewsPage.jsx
import { useState } from "react";
import LocalNews from "../components/LocalNews";
import "./NewsPage.css";

export default function NewsPage() {
  const [city, setCity] = useState("Bengaluru");
  const [inputCity, setInputCity] = useState("");

  const handleSearch = () => {
    if (!inputCity.trim()) return;
    setCity(inputCity.trim());
  };

  return (
    <div className="news-page">
      <h1 className="news-title">Local Weather News</h1>

      <div className="news-search-box">
        <input
          value={inputCity}
          onChange={(e) => setInputCity(e.target.value)}
          placeholder="Enter city..."
          className="news-input"
        />
        <button onClick={handleSearch} className="news-btn">
          Search
        </button>
      </div>

      <LocalNews city={city} />
    </div>
  );
}
