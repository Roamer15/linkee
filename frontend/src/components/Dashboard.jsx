import { Link } from "react-router";
import { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [longUrl, setLongUrl] = useState("");
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const data = await api.getMyUrls();
      setUrls(data.urls || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load URLs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!longUrl) {
  //     setError("Please enter a URL");
  //     return;
  //   }
  //   setError("");
  //   try {
  //     setLoading(true);
  //     const data = await api.shortenUrl({ longUrl });
  //     setSuccessMessage(data.shortened_URL);
  //     setLongUrl("");
  //     fetchUrls();
  //   } catch (err) {
  //     console.error(err);
  //     setError(err.message || "Failed to shorten URL");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!longUrl) {
      setError("Please enter a URL");
      return;
    }
    setError("");
    try {
      setLoading(true);
      const payload = {
        longUrl,
        customCode: customCode || undefined,
        expiresAt: expiresAt || undefined,
      };
      const data = await api.shortenUrl(payload);
      setSuccessMessage(data.shortened_URL);
      setLongUrl("");
      setCustomCode("");
      setExpiresAt("");
      fetchUrls();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to shorten URL");
    } finally {
      setLoading(false);
    }
  };
  

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <>
      <div className="dashboard">
        <div className="top">
          <div className="navbar-logo">
            <i className="fas fa-link logo-icon"></i>
            <a href="/" className="logo-text">
              Linkee
            </a>
          </div>

          <div className="top-links">
            <i className="fas fa-chart-line stat-icon"></i>
            <a href="/stats">Stats</a>
          </div>
        </div>
        <h1 className="dashboard-title">🚀 Welcome to Your Dashboard</h1>

        <form onSubmit={handleSubmit} className="shorten-form">
          <input
            type="url"
            placeholder="Enter a URL to shorten"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            className="url-input"
            required
          />
          <input
            type="text"
            placeholder="Custom code (optional)"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            className="url-input"
          />
          <input
            type="datetime-local"
            placeholder="Expiration date (optional)"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="url-input"
          />
          <button type="submit" className="shorten-button" disabled={loading}>
            {loading ? "Shortening..." : "Shorten"}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        {successMessage && (
          <div className="success-message">
            <a
              href={successMessage}
              target="_blank"
              rel="noopener noreferrer"
              className="success-link"
            >
              {successMessage}
            </a>
            <button
              onClick={() => copyToClipboard(successMessage)}
              className="copy-button"
            >
              Copy
            </button>
          </div>
        )}

        <h2 className="urls-title">Your Shortened URLs:</h2>

        {loading && urls.length === 0 ? (
          <div className="loading-stats">
            <p>Loading URLs...</p>
          </div>
        ) : urls.length === 0 ? (
          <p className="no-urls">No URLs yet.</p>
        ) : (
          <div className="urls-list">
            {urls.map((url) => (
              <div key={url.id} className="url-card">
                <p>
                  <span className="label">Original:</span>{" "}
                  <a
                    href={url.long_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="url-link"
                  >
                    {url.long_url}
                  </a>
                </p>
                <p>
                  <span className="label">Short:</span>{" "}
                  <a
                    href={url.short_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="url-link"
                  >
                    {url.short_url}
                  </a>
                  <button
                    onClick={() => copyToClipboard(url.short_url)}
                    className="copy-button small"
                  >
                    <i className="fas fa-copy"></i> Copy
                  </button>
                </p>
                <p>
                  <span className="label">Clicks:</span> {url.clicks}
                </p>
                <p>
                  <span className="label">Short Code:</span> {url.short_code}
                </p>
                <p>
                  <span className="label">Expiration Date:</span>{" "}
                  {url.expires_at === null
                    ? "None"
                    : new Date(url.expires_at).toLocaleString()}
                </p>
                <div className="stats-icon">
                  <Link
                    to={`/stats/${url.short_code}`}
                    className="stats-button"
                    title="View Stats"
                  >
                    <i className="fas fa-chart-bar"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
