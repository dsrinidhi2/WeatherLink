import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

/**
 * Navbar with:
 * - CloudCrew & My Alerts badges
 * - Theme toggle (CLASS + data-theme for compatibility)
 * - Nothing removed, only theme system fixed
 */

export default function Navbar() {
  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();

  // THEME
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setTheme(saved);

    // OLD (kept for safety)
    document.documentElement.setAttribute("data-theme", saved);

    // NEW (required for your .light selectors to work)
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(saved);
  }, []);

  function toggleTheme() {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);

    // Keep original behavior
    document.documentElement.setAttribute("data-theme", newTheme);

    // Add required class for your CSS
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);

    localStorage.setItem("theme", newTheme);
  }

  // notification counts
  const [cloudCrewCount, setCloudCrewCount] = useState(0);
  const [myAlertsCount, setMyAlertsCount] = useState(0);

  async function fetchCounts() {
    try {
      const resp = await fetch("/api/alerts/counts", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const d = await resp.json();
      if (d?.success && d.counts) {
        setCloudCrewCount(d.counts.cloudcrew || 0);
        setMyAlertsCount(d.counts.exclusive || 0);
      }
    } catch {}
  }

  useEffect(() => {
    fetchCounts();
    const t = setInterval(fetchCounts, 15000);
    return () => clearInterval(t);
  }, [token]);

  return (
    <div className="nav-wrap">
      <div className="nav-inner">
        <Link to="/" className="logo">
          <span className="logo-text">WeatherLink</span>
        </Link>

        <div className="nav-right">
          <Link to="/trends" className="nav-link">Trends</Link>
          <Link to="/insights" className="nav-link">Insights</Link>
          <Link to="/news" className="nav-link">News</Link>

          <Link to="/cloudcrew" className="nav-link notify-icon">
            👥 CloudCrew
            {cloudCrewCount > 0 && <span className="badge">{cloudCrewCount}</span>}
          </Link>

          <Link to="/my-alerts" className="nav-link notify-icon">
            🔔 My Alerts
            {myAlertsCount > 0 && <span className="badge">{myAlertsCount}</span>}
          </Link>

          <Link to="/favourites" className="nav-link">Favourites</Link>
          <Link to="/recents" className="nav-link">Recents</Link>

          <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "🌞" : "🌙"}
          </button>

          {user ? (
            <>
              <span className="nav-user">{user.name}</span>
              <button
                className="logout-btn"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
