import React, { useState, useRef, useEffect } from 'react';
import { Cpu, User, ChevronDown, Bell, Settings, LogOut, Shield } from 'lucide-react';

export default function Navbar({ view, setView, setAuthorityTab }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleNavClick = (targetView, hash) => {
    setView(targetView);
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  const handleMenuClick = (tabName) => {
    setIsMenuOpen(false);
    setView('authority');
    if (setAuthorityTab) {
      setAuthorityTab(tabName);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

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
          <a href="#dashboard" onClick={(e) => { e.preventDefault(); handleMenuClick('overview'); }} className={`nav-link ${view === 'authority' ? 'active' : ''}`}>Dashboard</a>
        </nav>

        <div className="header-actions" ref={menuRef} style={{ position: 'relative' }}>
          {/* Profile / Account Control */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--surface-color)',
              border: '1px solid var(--glass-border)',
              padding: '6px 14px',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'background 0.2s',
              textAlign: 'left'
            }}
          >
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(185,101,75,0.08)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={12} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }} className="nav-profile-info">
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.2' }}>City Admin</span>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Level 1 Clearance</span>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
          </button>

          {/* Account Dropdown Menu */}
          {isMenuOpen && (
            <div 
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '180px',
                background: 'var(--surface-color)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '6px',
                boxShadow: '0 4px 16px rgba(185,101,75,0.08)',
                zIndex: '1000',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              <button 
                onClick={() => handleMenuClick('profile')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }}
              >
                <User size={14} className="text-cyan" />
                <span>Profile</span>
              </button>
              
              <button 
                onClick={() => handleMenuClick('profile')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }}
              >
                <Shield size={14} className="text-cyan" />
                <span>Account Clearance</span>
              </button>

              <button 
                onClick={() => handleMenuClick('notifications')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }}
              >
                <Bell size={14} className="text-cyan" />
                <span>Notifications</span>
              </button>

              <button 
                onClick={() => handleMenuClick('settings')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }}
              >
                <Settings size={14} className="text-cyan" />
                <span>Settings</span>
              </button>

              <div style={{ height: '1px', background: 'var(--glass-border)', margin: '4px 0' }} />

              <button 
                onClick={() => { setIsMenuOpen(false); setView('home'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'none', border: 'none', color: '#B9654B', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
