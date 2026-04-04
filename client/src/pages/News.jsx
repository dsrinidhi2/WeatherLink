import React, { useEffect, useState } from "react";
import "./News.css";
import axios from "axios";

export default function News() {
  const [city, setCity] = useState("Bengaluru");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadNews(cityName) {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://weatherlink.onrender.com/api/news/${cityName}`
      );

      if (res.data.success) {
        setArticles(res.data.articles);
      } else {
        setArticles([]);
      }
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNews(city);
  }, []);

  return (
    <div className="news-page">
      <h1>Local Weather News</h1>

      <div className="search-box">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city..."
        />
        <button onClick={() => loadNews(city)}>Search</button>
      </div>

      {loading && <p className="loading">Loading…</p>}

      {!loading && articles.length === 0 && (
        <p className="no-news">No recent weather news found 😳</p>
      )}

      <div className="news-grid">
        {articles.map((a, i) => (
          <div className="news-card" key={i}>
            <h3>{a.title}</h3>
            <p className="date">{a.pubDate}</p>
            <p className="desc">{a.description.slice(0, 150)}...</p>
            <a href={a.link} target="_blank" rel="noreferrer">
              Read More →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
