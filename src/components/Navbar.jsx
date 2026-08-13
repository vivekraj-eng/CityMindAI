import React, { useState, useRef, useEffect } from 'react';
import { Cpu, User, ChevronDown, Bell, Settings, LogOut, Shield, List } from 'lucide-react';

export default function Navbar({ 
  view, 
  setView, 
  user, 
  setUser, 
  activeTab, 
  citizenTab 
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleSignOut = () => {
    if (setUser) {
      setUser(null);
      localStorage.removeItem('citymind_user');
      localStorage.removeItem('citymind_token');
    }
    setIsMenuOpen(false);
    setView('/login');
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
        <a href="/" className="logo-group" style={{ textDecoration: 'none' }}>
          <div className="logo-icon-wrapper">
            <Cpu className="logo-icon" size={22} />
            <div className="logo-glow"></div>
          </div>
          <span className="logo-text">CityMind<span className="accent-text">AI</span></span>
        </a>

        <nav className="main-nav">
          <a href="/" className={`nav-link ${view === 'home' ? 'active' : ''}`}>Platform</a>
          <a href="/reports" className={`nav-link ${view === 'citizen' && citizenTab === 'my-reports' ? 'active' : ''}`}>My Reports</a>
          <a href="/map" className={`nav-link ${activeTab === 'map' ? 'active' : ''}`}>Live Map</a>
          <a href="/analytics" className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}>Analytics</a>
          <a href="/workspace" className={`nav-link ${(view === 'citizen' || view === 'authority') ? 'active' : ''}`}>Workspace</a>
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
                  <a 
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '12px', borderRadius: '4px' }}
                  >
                    <User size={14} className="text-cyan" />
                    <span>Profile</span>
                  </a>
                  
                  <a 
                    href="/reports"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '12px', borderRadius: '4px' }}
                  >
                    <List size={14} className="text-cyan" />
                    <span>My Reports</span>
                  </a>

                  <a 
                    href="/workspace"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '12px', borderRadius: '4px' }}
                  >
                    <Bell size={14} className="text-cyan" />
                    <span>Notifications</span>
                  </a>

                  <a 
                    href="/workspace/settings"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '12px', borderRadius: '4px' }}
                  >
                    <Settings size={14} className="text-cyan" />
                    <span>Settings</span>
                  </a>

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
                  <a 
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '12px', borderRadius: '4px' }}
                  >
                    <User size={14} className="text-cyan" />
                    <span>Sign In</span>
                  </a>
                  
                  <a 
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '12px', borderRadius: '4px' }}
                  >
                    <PlusCircleIcon size={14} className="text-cyan" />
                    <span>Create Account</span>
                  </a>

                  <div style={{ height: '1px', background: 'var(--glass-border)', margin: '4px 0' }} />

                  <a 
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '12px', borderRadius: '4px' }}
                  >
                    <Shield size={14} className="text-cyan" />
                    <span>Authority Access</span>
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function PlusCircleIcon({ size, className }) {
  return <Cpu size={size} className={className} />;
}
