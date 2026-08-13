import React, { useState } from 'react';
import { Cpu, Mail, Lock, User, ArrowLeft } from 'lucide-react';

export default function RegisterPage({ setView, setUser, setCitizenTab }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all registration fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    // Mock register user session
    const registeredUser = { 
      name: fullName, 
      email, 
      role: 'Citizen' 
    };

    setUser(registeredUser);
    localStorage.setItem('citymind_user', JSON.stringify(registeredUser));
    setView('/reports');
    if (setCitizenTab) {
      setCitizenTab('my-reports');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)', padding: '24px' }}>
      <div className="list-card-wrapper" style={{ width: '100%', maxWidth: '420px', padding: '32px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px', boxShadow: '0 4px 24px rgba(185,101,75,0.04)' }}>
        
        {/* Back to Login link */}
        <button 
          onClick={() => setView('login')} 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', marginBottom: '20px', padding: 0 }}
        >
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </button>

        {/* Logo group */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ padding: '8px', background: 'rgba(185, 101, 75, 0.08)', borderRadius: '50%', color: 'var(--accent-cyan)', marginBottom: '12px' }}>
            <Cpu size={28} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Create Citizen Account
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            Register your email to file municipal complaints, check status timelines, and receive local updates.
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: '10px', background: 'rgba(185,101,75,0.08)', border: '1px solid rgba(185,101,75,0.2)', borderRadius: '4px', color: '#B9654B', fontSize: '12px', marginBottom: '16px', textAlign: 'center', fontWeight: '600' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <User size={12} /> Full Name
            </label>
            <input 
              type="text" 
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--surface-elevated)', color: 'var(--text-primary)', fontSize: '13px' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Mail size={12} /> Email Address
            </label>
            <input 
              type="email" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--surface-elevated)', color: 'var(--text-primary)', fontSize: '13px' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Clearance Role
            </label>
            <select 
              disabled
              value="Citizen"
              style={{ padding: '9px 12px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(185,101,75,0.04)', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'not-allowed' }}
            >
              <option value="Citizen">Citizen (Public Access)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={12} /> Password
            </label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--surface-elevated)', color: 'var(--text-primary)', fontSize: '13px' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={12} /> Confirm Password
            </label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--surface-elevated)', color: 'var(--text-primary)', fontSize: '13px' }}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ padding: '10px', fontSize: '13px', width: '100%', marginTop: '8px', justifyContent: 'center' }}
          >
            Create Account
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          <span>Already have an account? </span>
          <button onClick={() => setView('/login')} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: '700', padding: 0 }}>
            Sign In
          </button>
        </div>

      </div>
    </div>
  );
}
