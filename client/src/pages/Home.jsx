// client/src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-root">
      <div className="home-card animate-fade">
        <h1 className="home-title">Welcome to WeatherLink</h1>
        <p className="home-sub">Your personal weather companion 💙</p>

        <div className="home-buttons">
          <Link to="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
          <Link to="/insights" className="btn-secondary">
            View Insights
          </Link>
        </div>
      </div>
    </div>
  );
}
