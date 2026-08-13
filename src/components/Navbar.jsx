import React from 'react';
import { Cpu, ArrowRight } from 'lucide-react';

export default function Navbar({ view, setView }) {
  const handleNavClick = (targetView, hash) => {
    setView(targetView);
    if (hash) {
      // Delay slightly if transitioning from another page to allow DOM render
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  return (
    <header className="site-header">
      <div className="container header-container">
        <div className="logo-group" onClick={() => setView('home')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon-wrapper">
            <Cpu className="logo-icon" size={22} />
            <div className="logo-glow"></div>
          </div>
          <span className="logo-text">CityMind<span className="accent-text">AI</span></span>
        </div>

        <nav className="main-nav">
          <a href="#platform" onClick={(e) => { e.preventDefault(); handleNavClick('home', 'platform'); }} className={`nav-link ${view === 'home' ? '' : 'inactive'}`}>Platform</a>
          <a href="#how-it-works" onClick={(e) => { e.preventDefault(); handleNavClick('home', 'how-it-works'); }} className={`nav-link ${view === 'home' ? '' : 'inactive'}`}>How It Works</a>
          <a href="#intelligence" onClick={(e) => { e.preventDefault(); handleNavClick('home', 'intelligence'); }} className={`nav-link ${view === 'home' ? '' : 'inactive'}`}>Intelligence</a>
          <a href="#dashboard" onClick={(e) => { e.preventDefault(); setView('authority'); }} className={`nav-link ${view === 'authority' ? 'active' : ''}`}>Dashboard</a>
        </nav>

        <div className="header-actions">
          <button className="btn btn-secondary nav-btn-desktop" onClick={() => setView('authority')}>
            <span>Platform Access</span>
          </button>
          <button className="btn btn-primary" onClick={() => setView('citizen')}>
            <span>Report an Issue</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
