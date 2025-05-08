import { useState } from 'react';
import api from '../api';

export default function UrlShortener() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [customCode, setCustomCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.shortenUrl({ 
        longUrl,
        customCode: customCode || undefined
      });
      setShortUrl(data.shortUrl);
    } catch (err) {
      alert(err.response?.data?.message || 'Error shortening URL');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          placeholder="Paste your long URL"
          className="w-full p-2 mb-2 border rounded"
          required
        />
        <input
          type="text"
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          placeholder="Custom code (optional)"
          className="w-full p-2 mb-4 border rounded"
          pattern="[a-zA-Z0-9_-]{4,20}"
          title="4-20 chars: letters, numbers, _-"
        />
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Shorten
        </button>
      </form>

      {shortUrl && (
        <div className="mt-4 p-3 bg-gray-100 rounded break-all">
          <p>Short URL: <a href={shortUrl} className="text-blue-500">{shortUrl}</a></p>
          <button 
            onClick={() => navigator.clipboard.writeText(shortUrl)}
            className="mt-2 text-sm text-blue-500 hover:text-blue-700"
          >
            Copy to clipboard
          </button>
        </div>
      )}
    </div>
  );
}