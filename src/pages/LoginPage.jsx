import React, { useState } from 'react';
import { Cpu, Mail, Lock, Shield, ArrowLeft } from 'lucide-react';

export default function LoginPage({ setView, setUser, setCitizenTab }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthorityLogin, setIsAuthorityLogin] = useState(() => {
    return window.location.pathname === '/authority/login';
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all credentials.');
      return;
    }

    if (isAuthorityLogin) {
      // Mock Authority authentication
      if (email === 'admin@citymind.ai' || email.includes('admin')) {
        const adminUser = { name: 'City Admin', email, role: 'Authority', clearance: 'Level 1 Clearance' };
        setUser(adminUser);
        localStorage.setItem('citymind_user', JSON.stringify(adminUser));
        setView('/workspace');
      } else {
        setErrorMsg('Invalid authority credentials. Try admin@citymind.ai.');
      }
    } else {
      // Mock Citizen authentication
      const citizenUser = { name: email.split('@')[0], email, role: 'Citizen' };
      setUser(citizenUser);
      localStorage.setItem('citymind_user', JSON.stringify(citizenUser));
      setView('/reports');
      if (setCitizenTab) setCitizenTab('my-reports');
    }
  };

  const handleContinueAsGuest = () => {
    const guestUser = { name: 'Guest Citizen', email: 'guest@citymind.ai', role: 'Citizen' };
    setUser(guestUser);
    setView('/reports');
    if (setCitizenTab) setCitizenTab('my-reports');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)', padding: '24px' }}>
      <div className="list-card-wrapper" style={{ width: '100%', maxWidth: '400px', padding: '32px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px', boxShadow: '0 4px 24px rgba(185,101,75,0.04)' }}>
        
        {/* Header & Back arrow */}
        <button 
          onClick={() => setView('home')} 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', marginBottom: '20px', padding: 0 }}
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </button>

        {/* Logo group */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ padding: '8px', background: 'rgba(185, 101, 75, 0.08)', borderRadius: '50%', color: 'var(--accent-cyan)', marginBottom: '12px' }}>
            <Cpu size={28} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            {isAuthorityLogin ? 'Authority Access' : 'Welcome to CityMindAI'}
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            {isAuthorityLogin ? 'Sign in to municipal command center portal.' : 'Access citizen grievance reports, tracking, and AI triage diagnostics.'}
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: '10px', background: 'rgba(185,101,75,0.08)', border: '1px solid rgba(185,101,75,0.2)', borderRadius: '4px', color: '#B9654B', fontSize: '12px', marginBottom: '16px', textAlign: 'center', fontWeight: '600' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Mail size={12} /> Email Address
            </label>
            <input 
              type="email" 
              placeholder={isAuthorityLogin ? "admin@citymind.ai" : "you@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--surface-elevated)', color: 'var(--text-primary)', fontSize: '13px' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={12} /> Password
            </label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--surface-elevated)', color: 'var(--text-primary)', fontSize: '13px' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginTop: '2px' }}>
            <button type="button" onClick={() => alert("Simulation: Reset link sent to your email.")} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', padding: 0 }}>
              Forgot Password?
            </button>
            {!isAuthorityLogin && (
              <button type="button" onClick={() => setView('/signup')} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', padding: 0, fontWeight: '700' }}>
                Create Account
              </button>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ padding: '10px', fontSize: '13px', width: '100%', marginTop: '6px', justifyContent: 'center' }}
          >
            Sign In
          </button>
        </form>

        {!isAuthorityLogin && (
          <button 
            onClick={handleContinueAsGuest}
            className="btn btn-secondary"
            style={{ padding: '10px', fontSize: '13px', width: '100%', marginTop: '10px', justifyContent: 'center' }}
          >
            Continue as Citizen (Guest)
          </button>
        )}

        <div style={{ marginTop: '24px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px', textAlign: 'center' }}>
          <button 
            onClick={() => {
              setIsAuthorityLogin(!isAuthorityLogin);
              setErrorMsg('');
            }}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              fontSize: '12px', 
              cursor: 'pointer', 
              fontWeight: '600' 
            }}
          >
            <Shield size={14} className="text-cyan" />
            <span>{isAuthorityLogin ? "Are you a citizen? Sign In here" : "Are you an authority? Authority Access"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
