import React, { useEffect, useState } from "react";
import axios from "axios";
import "./LocalNews.css";

export default function LocalNews({ city }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Remove all HTML tags
  const stripHTML = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "");
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await axios.get(
          `https://weatherlink.onrender.com/api/news/${city}`
        );

        let cleaned = res.data.articles.map((item) => ({
          title: stripHTML(item.title),
          description: stripHTML(item.description || "").slice(0, 130),
          image: item.image || null,
          link: item.link,
          pubDate: item.pubDate,
        }));

        cleaned = cleaned.slice(0, 5);

        setNews(cleaned);
      } catch (e) {
        console.log("News error:", e);
      }
      setLoading(false);
    }

    load();
  }, [city]);

  return (
    <div className="news-wrapper">
      {loading && <p className="loading">Loading news...</p>}

      {!loading && news.length === 0 && (
        <p className="no-news">No weather news found for {city}.</p>
      )}

      <div className="news-grid">
        {news.map((n, idx) => (
          <div className="news-card" key={idx}>
            {n.image ? (
              <img src={n.image} alt="" className="news-img" />
            ) : (
              <div className="news-img placeholder">No Image</div>
            )}

            <h3 className="news-title">{n.title}</h3>
            <p className="news-desc">{n.description}...</p>
            <p className="news-date">{n.pubDate}</p>

            <a
              href={n.link}
              className="news-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read More →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
