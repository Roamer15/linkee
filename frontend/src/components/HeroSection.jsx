
export default function HeroSection() {
    const handleSubmit = () => {
        
    }
  return (
    <div className="hero-container">
      <div className="hero-flex">
        <div className="hero-text-section">
          <h1 className="hero-title">
            Shorten, Share and <span className="gradient-text">Track</span> Your Links
          </h1>
          <p className="hero-description">
            Linkee helps you create short, memorable links and provides powerful analytics to track your audience. Perfect for marketers, creators, and businesses.
          </p>

          {/* URL Shortener Form */}
          <div className="url-form-container">
            <form id="urlForm" className="url-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="url" className="form-label">Enter your long URL</label>
                <div className="form-input-group">
                  <input
                    type="url"
                    id="url"
                    placeholder="https://example.com/very-long-url"
                    className="url-input"
                    required
                  />
                  <button type="submit" className="shorten-button">
                    <span>Shorten</span>
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
