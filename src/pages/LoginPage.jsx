import React, { useState } from 'react';
import { Cpu, Mail, Lock, Shield, ArrowLeft } from 'lucide-react';
import { signInWithEmail, signInWithGoogle } from '../services/supabase';

export default function LoginPage({ setView, setUser, setCitizenTab }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthorityLogin, setIsAuthorityLogin] = useState(() => {
    return window.location.pathname === '/authority/login';
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all credentials.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const result = await signInWithEmail(email.trim(), password);
      if (result && result.user) {
        // Exclude normal citizens from accessing authority workspace
        if (isAuthorityLogin && result.user.role !== 'Authority') {
          throw new Error('This account does not have municipal authority access.');
        }

        setUser(result.user);
        localStorage.setItem('citymind_user', JSON.stringify(result.user));
        if (result.token) {
          localStorage.setItem('citymind_token', result.token);
        }

        if (result.user.role === 'Authority') {
          setView('/workspace');
        } else {
          setView('/reports');
          if (setCitizenTab) setCitizenTab('my-reports');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    const guestUser = { name: 'Guest Citizen', email: 'guest@citymind.ai', role: 'Citizen' };
    setUser(guestUser);
    localStorage.setItem('citymind_user', JSON.stringify(guestUser));
    setView('/reports');
    if (setCitizenTab) setCitizenTab('my-reports');
  };

  const handleGoogleSignIn = () => {
    setErrorMsg('');
    try {
      signInWithGoogle();
    } catch (err) {
      setErrorMsg(err.message || 'Google OAuth failed to redirect.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)', padding: '24px' }}>
      <div className="list-card-wrapper" style={{ width: '100%', maxWidth: '400px', padding: '32px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px', boxShadow: '0 4px 24px rgba(185,101,75,0.04)' }}>
        
        {/* Header & Back arrow */}
        <button 
          onClick={() => setView('/')} 
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
              disabled={loading}
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
              disabled={loading}
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
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {!isAuthorityLogin && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', gap: '10px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
            </div>

            <button 
              onClick={handleGoogleSignIn}
              className="btn btn-secondary"
              style={{ padding: '10px', fontSize: '13px', width: '100%', justifyContent: 'center', gap: '8px', border: '1px solid var(--glass-border)' }}
              disabled={loading}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <button 
              onClick={handleContinueAsGuest}
              className="btn btn-secondary"
              style={{ padding: '10px', fontSize: '13px', width: '100%', marginTop: '10px', justifyContent: 'center' }}
              disabled={loading}
            >
              Continue as Citizen (Guest)
            </button>
          </>
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
            disabled={loading}
          >
            <Shield size={14} className="text-cyan" />
            <span>{isAuthorityLogin ? "Are you a citizen? Sign In here" : "Are you an authority? Authority Access"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
