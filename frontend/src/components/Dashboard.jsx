import { useEffect, useState } from 'react';
import api from '../api'; // Adjust if needed

export default function Dashboard() {
  const [longUrl, setLongUrl] = useState('');
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const data = await api.getMyUrls();
      console.log(data)
      setUrls(data.urls || []); // Adjust based on your backend response
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load URLs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!longUrl) {
      setError('Please enter a URL');
      return;
    }
    setError('');
    try {
      setLoading(true);
      const data = await api.shortenUrl({ longUrl }); // Adjust field name if needed
      setSuccessMessage(`Short URL created: ${data.shortened_URL}`);
      setLongUrl('');
      // Optionally refresh URLs list
      fetchUrls();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Welcome to Your Dashboard</h1>

      <form onSubmit={handleSubmit} className="shorten-form">
        <input
          type="url"
          placeholder="Enter a URL to shorten"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          className="form-input"
          required
        />
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Shortening...' : 'Shorten URL'}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}
      {successMessage && <p className="success-text">{successMessage}</p>}

      <h2 className="dashboard-subtitle">Your Shortened URLs:</h2>

      {loading && urls.length === 0 ? (
        <p>Loading URLs...</p>
      ) : urls.length === 0 ? (
        <p>No URLs yet.</p>
      ) : (
        <ul className="url-list">
          {urls.map((url) => (
            <li key={url.id} className="url-item">
              <p>Original: <a href={url.long_url} target="_blank" rel="noopener noreferrer">{url.long_url}</a></p>
              <p>Short: <a href={url.shortUrl} target="_blank" rel="noopener noreferrer">{url.shortUrl}</a></p>
              <p>Clicks: {url.clicks}</p>
              <p>Short Code: {url.short_code}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
