import React from 'react';
import { Cpu, ArrowRight } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="container header-container">
        <div className="logo-group">
          <div className="logo-icon-wrapper">
            <Cpu className="logo-icon" size={22} />
            <div className="logo-glow"></div>
          </div>
          <span className="logo-text">CityMind<span className="accent-text">AI</span></span>
        </div>

        <nav className="main-nav">
          <a href="#platform" className="nav-link">Platform</a>
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#intelligence" className="nav-link">Intelligence</a>
          <a href="#dashboard" className="nav-link">Dashboard</a>
        </nav>

        <div className="header-actions">
          <button className="btn btn-secondary nav-btn-desktop">
            <span>Platform Access</span>
          </button>
          <a href="#report" className="btn btn-primary">
            <span>Report an Issue</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}
