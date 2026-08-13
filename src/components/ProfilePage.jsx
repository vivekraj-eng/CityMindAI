import React, { useState, useEffect } from 'react';
import { User, Shield, Mail, CheckCircle2, Edit2 } from 'lucide-react';

export default function ProfilePage({ user, setUser }) {
  const [profile, setProfile] = useState({
    name: user?.name || 'City Admin',
    email: user?.email || 'admin@citymind.ai',
    role: user?.role || 'Senior Operational Engineer',
    department: 'Municipal Command Center',
    clearance: user?.clearance || 'Level 1 Clearance',
    status: 'Active Duty'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        role: user.role || prev.role,
        clearance: user.clearance || prev.clearance
      }));
      setEditForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        role: user.role || prev.role,
        clearance: user.clearance || prev.clearance
      }));
    }
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    setProfile({ ...editForm });
    if (setUser && user) {
      const updated = {
        ...user,
        name: editForm.name,
        email: editForm.email,
        role: editForm.role
      };
      setUser(updated);
      localStorage.setItem('citymind_user', JSON.stringify(updated));
    }
    setIsEditing(false);
  };

  return (
    <div className="profile-container">
      <div className="overview-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div className="title-area">
          <h2 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '4px' }}>Administrator Profile</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Manage your personal credentials, authority status, and operations clearance permissions.</p>
        </div>
      </div>

      <div className="list-card-wrapper" style={{ padding: '24px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
          {/* Avatar Icon */}
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--surface-elevated)', border: '2px solid rgba(185, 101, 75, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
            <User size={36} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{profile.name}</h3>
            <span style={{ fontSize: '12px', background: 'rgba(185, 101, 75, 0.08)', color: '#B9654B', padding: '2px 8px', borderRadius: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {profile.clearance}
            </span>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Full Name</label>
              <input 
                type="text" 
                value={editForm.name} 
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--surface-elevated)', color: 'var(--text-primary)', fontSize: '13px' }}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Email Address</label>
              <input 
                type="email" 
                value={editForm.email} 
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--surface-elevated)', color: 'var(--text-primary)', fontSize: '13px' }}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Operation Role</label>
              <input 
                type="text" 
                value={editForm.role} 
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--surface-elevated)', color: 'var(--text-primary)', fontSize: '13px' }}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="submit" className="btn btn-primary" style={{ fontSize: '12px', padding: '8px 16px' }}>Save Profile</button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)} style={{ fontSize: '12px', padding: '8px 16px' }}>Cancel</button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', fontSize: '13px' }}>
            <div style={{ padding: '12px', background: 'var(--surface-elevated)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Clearance Role</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--text-primary)' }}>
                <Shield size={14} className="text-cyan" />
                {profile.role}
              </span>
            </div>

            <div style={{ padding: '12px', background: 'var(--surface-elevated)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Email Contact</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--text-primary)' }}>
                <Mail size={14} className="text-cyan" />
                {profile.email}
              </span>
            </div>

            <div style={{ padding: '12px', background: 'var(--surface-elevated)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Account Status</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: '#2e7d32' }}>
                <CheckCircle2 size={14} />
                {profile.status}
              </span>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
              <button 
                onClick={() => setIsEditing(true)}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Edit2 size={12} />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
