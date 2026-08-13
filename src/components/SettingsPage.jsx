import React, { useState, useEffect } from 'react';
import { Settings, Shield, Bell, Eye, Map, Sliders, Info } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState(() => {
    const local = localStorage.getItem('citymind_settings');
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
    return {
      notificationsEmail: true,
      notificationsUrgent: true,
      reducedMotion: false,
      mapStyle: 'roadmap',
      mapDefaultZoom: 12,
      privacyShareCoords: true,
      systemTelemetry: true
    };
  });

  useEffect(() => {
    localStorage.setItem('citymind_settings', JSON.stringify(settings));
  }, [settings]);

  const handleChange = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="settings-container">
      <div className="overview-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div className="title-area">
          <h2 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '4px' }}>Operations Settings</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Configure notification parameters, UI reduced motion visual settings, map default options, and telemetry sharing.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Notifications & Account Section */}
        <div className="list-card-wrapper" style={{ padding: '20px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14.5px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={16} className="text-cyan" />
            <span>Alerts & Notifications</span>
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>Email Dispatch Alerts</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Send copies of critical high priority tickets to supervisor.</span>
              </div>
              <input 
                type="checkbox" 
                checked={settings.notificationsEmail} 
                onChange={(e) => handleChange('notificationsEmail', e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-cyan)' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>Urgent Hotspot Alerts</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Notify immediately on active multi-report spatial hotspots.</span>
              </div>
              <input 
                type="checkbox" 
                checked={settings.notificationsUrgent} 
                onChange={(e) => handleChange('notificationsUrgent', e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-cyan)' }}
              />
            </label>
          </div>
        </div>

        {/* Appearance & Motion Section */}
        <div className="list-card-wrapper" style={{ padding: '20px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14.5px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={16} className="text-cyan" />
            <span>Appearance & Motion</span>
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>Reduced Motion Settings</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mute sidebar slides, modal scale transitions, and particle canvas.</span>
              </div>
              <input 
                type="checkbox" 
                checked={settings.reducedMotion} 
                onChange={(e) => handleChange('reducedMotion', e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-cyan)' }}
              />
            </label>
            
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Theme preference</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Locked: Warm Peach Cinematic theme (Hackathon Active Default)</span>
            </div>
          </div>
        </div>

        {/* Map Preferences Section */}
        <div className="list-card-wrapper" style={{ padding: '20px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14.5px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Map size={16} className="text-cyan" />
            <span>Map Preferences</span>
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>Default Map Mode</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Choose layout canvas to render.</span>
              </div>
              <select 
                value={settings.mapStyle} 
                onChange={(e) => handleChange('mapStyle', e.target.value)}
                style={{ padding: '4px 8px', background: 'var(--surface-elevated)', border: '1px solid var(--glass-border)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-primary)' }}
              >
                <option value="roadmap">Roadmap Geography</option>
                <option value="satellite">Satellite Imagery</option>
                <option value="hybrid">Hybrid Maps</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>Default Zoom Range</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Starting zoom index on map load.</span>
              </div>
              <input 
                type="number" 
                min="3" 
                max="19" 
                value={settings.mapDefaultZoom} 
                onChange={(e) => handleChange('mapDefaultZoom', parseInt(e.target.value))}
                style={{ width: '60px', padding: '4px 6px', background: 'var(--surface-elevated)', border: '1px solid var(--glass-border)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-primary)', textAlign: 'center' }}
              />
            </div>
          </div>
        </div>

        {/* Privacy & System Section */}
        <div className="list-card-wrapper" style={{ padding: '20px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14.5px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} className="text-cyan" />
            <span>Privacy & System</span>
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>Device Geolocation Sharing</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Share device coordinate access for positioning calculations.</span>
              </div>
              <input 
                type="checkbox" 
                checked={settings.privacyShareCoords} 
                onChange={(e) => handleChange('privacyShareCoords', e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-cyan)' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>Operational Telemetry Logs</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Share anonymized usage logs to improve municipal routing.</span>
              </div>
              <input 
                type="checkbox" 
                checked={settings.systemTelemetry} 
                onChange={(e) => handleChange('systemTelemetry', e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-cyan)' }}
              />
            </label>
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', gap: '8px', padding: '12px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '24px', alignItems: 'center' }}>
        <Info size={16} className="text-cyan" style={{ flexShrink: 0 }} />
        <span>Settings are persisted locally in browser localStorage for secure terminal operations.</span>
      </div>

    </div>
  );
}
