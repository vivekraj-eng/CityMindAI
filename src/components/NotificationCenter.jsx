import React from 'react';
import { Bell, AlertTriangle, Clock, Sparkles, MapPin } from 'lucide-react';

export default function NotificationCenter({ complaints }) {
  const notifications = [];

  // 1. Critical cases
  const criticals = complaints.filter(c => (c.urgency === 'High' || c.urgency === 'Critical') && c.status !== 'Resolved');
  criticals.forEach(c => {
    notifications.push({
      id: `critical-${c.id}`,
      type: 'critical',
      title: 'Critical Incident Logged',
      message: `High urgency case reported: "${c.title}" at ${c.location}.`,
      time: c.createdAt || c.created_at,
      icon: AlertTriangle,
      color: '#B9654B'
    });
  });

  // 2. Assigned cases
  const assigned = complaints.filter(c => c.status === 'Assigned');
  assigned.forEach(c => {
    notifications.push({
      id: `assigned-${c.id}`,
      type: 'assigned',
      title: 'Task Dispatched to Department',
      message: `"${c.title}" routed to ${c.category} crew.`,
      time: c.updatedAt || c.createdAt,
      icon: Clock,
      color: '#3b82f6'
    });
  });

  // 3. Hotspots
  const locationCounts = {};
  complaints.forEach(c => {
    if (c.status !== 'Resolved') {
      const k = c.location?.toLowerCase().trim();
      locationCounts[k] = (locationCounts[k] || 0) + 1;
    }
  });
  Object.entries(locationCounts).forEach(([loc, cnt]) => {
    if (cnt >= 2) {
      notifications.push({
        id: `hotspot-${loc}`,
        type: 'hotspot',
        title: 'Active Hotspot Flagged',
        message: `Area "${loc}" flagged with ${cnt} overlapping grievances.`,
        time: new Date().toISOString(),
        icon: MapPin,
        color: '#B9654B'
      });
    }
  });

  // 4. Response Delay
  const delayed = complaints.filter(c => c.isSlaDelayed);
  delayed.forEach(c => {
    notifications.push({
      id: `delayed-${c.id}`,
      type: 'delay',
      title: 'Response SLA Breach Looming',
      message: `SLA warning: "${c.title}" at ${c.location} is awaiting response for over 4 hours.`,
      time: c.createdAt,
      icon: AlertTriangle,
      color: '#d97706'
    });
  });

  // 5. AI Recommendations
  const aiAvailable = complaints.filter(c => c.description?.length > 10);
  aiAvailable.slice(0, 3).forEach(c => {
    notifications.push({
      id: `ai-${c.id}`,
      type: 'ai',
      title: 'Gemini Action Advisory Ready',
      message: `AI diagnostic directives compiled for case #${c.id.toString().slice(-4)}.`,
      time: c.createdAt,
      icon: Sparkles,
      color: 'var(--accent-cyan)'
    });
  });

  return (
    <div className="notifications-container">
      <div className="overview-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div className="title-area">
          <h2 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '4px' }}>Incident Alerts & Notifications</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Automated civic operational notifications generated dynamically from current city telemetry.</p>
        </div>
      </div>

      <div className="list-card-wrapper" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={16} className="text-cyan" />
          <span>Active Notifications ({notifications.length})</span>
        </h3>

        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
            <Bell size={36} className="text-muted" style={{ marginBottom: '12px' }} />
            <p>No active operational notifications generated.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map((notif) => {
              const Icon = notif.icon;
              return (
                <div 
                  key={notif.id} 
                  style={{ 
                    display: 'flex', 
                    gap: '14px', 
                    padding: '14px', 
                    background: 'var(--surface-color)', 
                    border: '1px solid var(--glass-border)', 
                    borderRadius: '6px',
                    borderLeft: `4px solid ${notif.color}`
                  }}
                >
                  <div style={{ color: notif.color, marginTop: '2px' }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{notif.title}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {new Date(notif.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>{notif.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
