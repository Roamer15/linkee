import { useState, useEffect } from "react";
import { useParams } from "react-router";
import api from "../api";

export default function Stats() {
  const { shortCode } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getStats(shortCode);
        console.log(response);
        setStats(response);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setError("Failed to load stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [shortCode]);

  if (loading)
    return (
      <div className="loading-stats">
        <p>Loading stats...</p>
      </div>
    );
  if (error) return <p>{error}</p>;

  return (
    <>
      <div className="top-stat">
        <div className="navbar-logo">
          <i className="fas fa-link logo-icon"></i>
          <a href="/" className="logo-text">
            Linkee
          </a>
        </div>

        <a href="/dashboard" className="back-button">
          Go Back
        </a>
      </div>
      <div className="stats-container">
        <div className="stats-page">
          <h2>Stats for Short Code: {shortCode}</h2>
          <p>
            <strong>Original URL:</strong> {stats.long_url}
          </p>
          <p>
            <strong>Clicks:</strong> {stats.clicks}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {new Date(stats.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Expires At:</strong>{" "}
            {stats.expiresAt
              ? new Date(stats.expiresAt).toLocaleString()
              : "None"}
          </p>
          <ul>
            <b> CLick logs are as follows </b> <br />
            {stats.timeClicks.length === 0 && <li>No click logs available.</li>}
            {stats.timeClicks.map((timeclick, index) => (
              <li key={index}>
                {index + 1}. Clicked at:{" "}
                <strong>
                  {new Date(timeclick.clicked_at).toLocaleString()}
                </strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
