import React, { useState, useRef, useEffect } from 'react';
import { Cpu, User, ChevronDown, Bell, Settings, LogOut, Shield, List, Sparkles } from 'lucide-react';

export default function Navbar({ view, setView, user, setUser, setAuthorityTab, setCitizenTab }) {
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

  const handleProfileClick = () => {
    if (!user) {
      setView('login');
      setIsMenuOpen(false);
      return;
    }
    
    if (user.role === 'Authority') {
      setView('authority');
      if (setAuthorityTab) setAuthorityTab('profile');
    } else {
      setView('citizen');
      if (setCitizenTab) setCitizenTab('profile');
    }
    setIsMenuOpen(false);
  };

  const handleMyReportsClick = () => {
    if (!user) return;
    if (user.role === 'Authority') {
      setView('authority');
      if (setAuthorityTab) setAuthorityTab('overview');
    } else {
      setView('citizen');
      if (setCitizenTab) setCitizenTab('my-reports');
    }
    setIsMenuOpen(false);
  };

  const handleNotificationsClick = () => {
    if (!user) return;
    if (user.role === 'Authority') {
      setView('authority');
      if (setAuthorityTab) setAuthorityTab('notifications');
    } else {
      setView('citizen');
      if (setCitizenTab) setCitizenTab('profile'); // citizen alerts are shown on profile settings
    }
    setIsMenuOpen(false);
  };

  const handleSettingsClick = () => {
    if (!user) return;
    if (user.role === 'Authority') {
      setView('authority');
      if (setAuthorityTab) setAuthorityTab('settings');
    } else {
      setView('citizen');
      if (setCitizenTab) setCitizenTab('profile'); // citizen settings are on profile
    }
    setIsMenuOpen(false);
  };

  const handleSignOut = () => {
    if (setUser) {
      setUser(null);
      localStorage.removeItem('citymind_user');
    }
    setIsMenuOpen(false);
    setView('home');
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
          {user && user.role === 'Authority' && (
            <a href="#dashboard" onClick={(e) => { e.preventDefault(); setView('authority'); }} className={`nav-link ${view === 'authority' ? 'active' : ''}`}>Dashboard</a>
          )}
          {user && user.role === 'Citizen' && (
            <a href="#workspace" onClick={(e) => { e.preventDefault(); setView('citizen'); }} className={`nav-link ${view === 'citizen' ? 'active' : ''}`}>Workspace</a>
          )}
        </nav>

        <div className="header-actions" ref={menuRef} style={{ position: 'relative' }}>
          {/* Profile / Account Trigger */}
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
            
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column' }} className="nav-profile-info">
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.2' }}>{user.name}</span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{user.role} Access</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }} className="nav-profile-info">
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.2' }}>Guest Account</span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Not Signed In</span>
              </div>
            )}

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
              {user ? (
                <>
                  <button 
                    onClick={handleProfileClick}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }}
                  >
                    <User size={14} className="text-cyan" />
                    <span>Profile</span>
                  </button>
                  
                  <button 
                    onClick={handleMyReportsClick}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }}
                  >
                    <List size={14} className="text-cyan" />
                    <span>My Reports</span>
                  </button>

                  <button 
                    onClick={handleNotificationsClick}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }}
                  >
                    <Bell size={14} className="text-cyan" />
                    <span>Notifications</span>
                  </button>

                  <button 
                    onClick={handleSettingsClick}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }}
                  >
                    <Settings size={14} className="text-cyan" />
                    <span>Settings</span>
                  </button>

                  <div style={{ height: '1px', background: 'var(--glass-border)', margin: '4px 0' }} />

                  <button 
                    onClick={handleSignOut}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'none', border: 'none', color: '#B9654B', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => { setIsMenuOpen(false); setView('login'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }}
                  >
                    <User size={14} className="text-cyan" />
                    <span>Sign In</span>
                  </button>
                  
                  <button 
                    onClick={() => { setIsMenuOpen(false); setView('register'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }}
                  >
                    <PlusCircleIcon size={14} className="text-cyan" />
                    <span>Create Account</span>
                  </button>

                  <div style={{ height: '1px', background: 'var(--glass-border)', margin: '4px 0' }} />

                  <button 
                    onClick={() => { setIsMenuOpen(false); setView('login'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', textAlign: 'left' }}
                  >
                    <Shield size={14} className="text-cyan" />
                    <span>Authority Access</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Simple Helper icon because PlusCircle is not imported but is used in guest fallback
function PlusCircleIcon({ size, className }) {
  return <Cpu size={size} className={className} />;
}
