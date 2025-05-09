import { useState } from 'react';
//import './Navbar.css'; // make sure to create this CSS file

export default function Navbar(){
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <i className="fas fa-link logo-icon"></i>
          <span className="logo-text">Linkee</span>
        </div>

        <div className="navbar-links">
          <a href="#testimonials">Dashboard</a>
        </div>

        <div className="navbar-actions">
          <a href="/login" className="login-btn">Log In</a>
          <a href="/register" className="signup-btn">Sign Up Free</a>
        </div>

        <button
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <a href="#testimonials">Dashboard</a>
          <div className="mobile-menu-actions">
            <a href="/login" className="login-btn">Log In</a>
            <a href="/register" className="signup-btn">Sign Up</a>
          </div>
        </div>
      )}
    </nav>
  );
};

