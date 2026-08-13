import React from 'react';
import { 
  Building2, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  ShieldAlert, 
  TrendingUp,
  ChevronRight,
  ArrowRight,
  BarChart3
} from 'lucide-react';

export default function Overview({ complaints, onNavigateToTab, onSelectTicket }) {
  const total = complaints.length;
  
  // Calculate metrics
  const activeCount = complaints.filter(c => c.status !== 'Resolved').length;
  const criticalCount = complaints.filter(
    c => (c.urgency === 'High' || c.urgency === 'Critical') && c.status !== 'Resolved'
  ).length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  const criticalAlertsList = complaints.filter(
    c => (c.urgency?.toLowerCase() === 'high' || c.urgency?.toLowerCase() === 'critical') && c.status !== 'Resolved'
  );

  // Group active complaints to detect locations with multiple complaints (Hotspots)
  const getActiveHotspots = () => {
    const counts = {};
    complaints.forEach(c => {
      if (c.status !== 'Resolved') {
        const key = c.location?.toLowerCase().trim() || 'unknown';
        if (!counts[key]) {
          counts[key] = { location: c.location, count: 0, category: c.category };
        }
        counts[key].count += 1;
      }
    });
    return Object.values(counts).filter(h => h.count >= 2).sort((a, b) => b.count - a.count);
  };
  const hotspots = getActiveHotspots();

  // Department Workloads helper
  const departments = [
    { name: 'Roads & Infrastructure', key: 'Roads' },
    { name: 'Water & Sanitation', key: 'Sanitation' },
    { name: 'Public Safety', key: 'Safety' },
    { name: 'Waste Management', key: 'Waste' },
    { name: 'Lighting & Electricity', key: 'Electrical' }
  ];

  const getWorkloadPercentage = (deptName) => {
    const deptComplaints = complaints.filter(c => c.category === deptName);
    if (deptComplaints.length === 0) return 0;
    const unresolved = deptComplaints.filter(c => c.status !== 'Resolved').length;
    return Math.round((unresolved / complaints.filter(c => c.status !== 'Resolved').length) * 100) || 0;
  };

  // Render Co-Pilot insights dynamically based on actual complaints
  const getCoPilotInsights = () => {
    const insights = [];

    // 1. Cluster check
    const locationGroups = {};
    complaints.forEach(c => {
      if (c.status !== 'Resolved') {
        locationGroups[c.location] = (locationGroups[c.location] || 0) + 1;
      }
    });
    const clusters = Object.entries(locationGroups).filter(([_, count]) => count >= 2);
    if (clusters.length > 0) {
      insights.push({
        type: 'cluster',
        message: `Incident cluster detected: ${clusters[0][1]} active reports near "${clusters[0][0]}".`,
        desc: 'Review related complaints to optimize crew dispatches.'
      });
    }

    // 2. Queue workloads
    const unassignedCount = complaints.filter(c => c.status === 'Submitted').length;
    if (unassignedCount > 0) {
      insights.push({
        type: 'workload',
        message: `${unassignedCount} new complaints are currently awaiting triage or assignment.`,
        desc: 'Gemini Auto-Triage log generated. Review in priority queue.'
      });
    }

    // 3. Peak department workload
    let maxDeptName = 'Roads & Infrastructure';
    let maxCount = 0;
    departments.forEach(d => {
      const cnt = complaints.filter(c => c.category === d.name && c.status !== 'Resolved').length;
      if (cnt > maxCount) {
        maxCount = cnt;
        maxDeptName = d.name;
      }
    });
    insights.push({
      type: 'peak',
      message: `"${maxDeptName}" currently holds the peak operations workload.`,
      desc: `${maxCount} unresolved cases currently assigned to engineering crews.`
    });

    return insights;
  };

  const insights = getCoPilotInsights();

  // Top 6 priority tickets (Critical/High first, then older tickets)
  const priorityQueue = [...complaints]
    .filter(c => c.status !== 'Resolved')
    .sort((a, b) => {
      const getPriorityVal = (p) => {
        const valMap = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return valMap[p?.toLowerCase()] || 2;
      };
      return getPriorityVal(b.urgency) - getPriorityVal(a.urgency);
    })
    .slice(0, 6);

  return (
    <div className="overview-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div className="overview-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="title-area">
          <h2 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '4px' }}>Civic Intelligence Overview</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Real-time operations center for city-wide alerts, workloads, queues, and AI-triage.</p>
        </div>
        <div className="date-status-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '12px' }}>
          <span className="dot dot-green" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#2e7d32' }}></span>
          <span style={{ color: 'var(--text-secondary)' }}>Command Center Live</span>
          <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* 1. Critical Alerts Banner */}
      {criticalAlertsList.length > 0 && (
        <div className="critical-alerts-banner" style={{ border: '1px solid rgba(185, 101, 75, 0.25)', borderRadius: '8px', padding: '16px', background: 'rgba(185, 101, 75, 0.04)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#B9654B', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <AlertCircle size={15} />
            <span>Critical Dispatch Alerts ({criticalAlertsList.length})</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {criticalAlertsList.map((alert) => (
              <div key={alert.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-color)', padding: '10px 14px', borderRadius: '4px', borderLeft: '3.5px solid #B9654B', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)', fontSize: '12.5px', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>{alert.title}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Loc: {alert.location} | Dept: {alert.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', background: 'rgba(185,101,75,0.08)', color: '#B9654B', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>Elapsed: {alert.timeElapsedStr || '0m'}</span>
                  <span style={{ fontSize: '11px', background: 'var(--surface-elevated)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>Status: {alert.status}</span>
                  <button 
                    onClick={() => onSelectTicket(alert.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                  >
                    <span>Triage</span>
                    <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Civic Overview KPI Grid */}
      <div className="metrics-banner-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="metric-card card-cyan">
          <div className="metric-card-content">
            <span className="metric-label">Active Complaints</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="metric-value">{activeCount}</span>
              <span style={{ fontSize: '11px', color: '#B9654B', display: 'flex', alignItems: 'center', gap: '2px' }}><TrendingUp size={12} /> Live</span>
            </div>
            <span className="metric-subtext">Unresolved grievances</span>
          </div>
          <Building2 size={24} className="metric-card-icon" />
        </div>

        <div className="metric-card card-red">
          <div className="metric-card-content">
            <span className="metric-label">Critical Issues</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="metric-value" style={{ color: 'var(--accent-cyan)' }}>{criticalCount}</span>
              {criticalCount > 0 && (
                <span style={{ fontSize: '10px', background: 'rgba(185, 101, 75, 0.1)', color: 'var(--accent-cyan)', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>Immediate Action</span>
              )}
            </div>
            <span className="metric-subtext">Urgent dispatch response</span>
          </div>
          <AlertCircle size={24} className="metric-card-icon text-red" />
        </div>

        <div className="metric-card card-yellow">
          <div className="metric-card-content">
            <span className="metric-label">In Progress</span>
            <span className="metric-value">{inProgressCount}</span>
            <span className="metric-subtext">Crews actively on-site</span>
          </div>
          <Clock size={24} className="metric-card-icon text-yellow" />
        </div>

        <div className="metric-card card-green">
          <div className="metric-card-content">
            <span className="metric-label">Resolved Today</span>
            <span className="metric-value">{resolvedCount}</span>
            <span className="metric-subtext">Completed grievances ledger</span>
          </div>
          <CheckCircle2 size={24} className="metric-card-icon text-green" />
        </div>
      </div>

      {/* 3. Hotspots Box */}
      <div className="list-card-wrapper" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={16} className="text-cyan" />
          <span>Active Location Hotspots Detected ({hotspots.length})</span>
        </h3>
        {hotspots.length === 0 ? (
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>No active spatial incident hotspots detected.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {hotspots.map((spot, idx) => (
              <div key={idx} style={{ padding: '10px 14px', background: 'var(--surface-elevated)', borderRadius: '4px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>{spot.location}</span>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>Dominant: {spot.category?.split(' & ')[0]}</span>
                </div>
                <span style={{ fontSize: '11px', background: 'rgba(185, 101, 75, 0.08)', color: '#B9654B', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', border: '1px solid rgba(185,101,75,0.15)' }}>
                  {spot.count} Reports
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Department Workload */}
      <div className="list-card-wrapper" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={16} className="text-cyan" />
          <span>Department Workload Share</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {departments.map((dept, idx) => {
            const countActive = complaints.filter(c => c.category === dept.name && c.status !== 'Resolved').length;
            const workloadPercent = getWorkloadPercentage(dept.name);
            
            return (
              <div key={idx} style={{ background: 'var(--surface-elevated)', padding: '12px', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{dept.key}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{countActive} active ({workloadPercent}%)</span>
                </div>
                <div style={{ height: '6px', background: 'var(--surface-color)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div 
                    style={{ height: '100%', width: `${Math.max(4, workloadPercent)}%`, background: 'var(--accent-cyan)', borderRadius: '3px' }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Complaint Queue (Priority Dispatch Queue) */}
      <div className="list-card-wrapper" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={16} className="text-cyan" />
            <span>Priority Dispatch Queue</span>
          </h3>
          <button 
            onClick={() => onNavigateToTab('complaints')}
            style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
          >
            <span>Full Queue</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {priorityQueue.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
            <CheckCircle2 size={32} className="text-green" style={{ marginBottom: '12px' }} />
            <p>All grievances resolved. Grid workspace clear.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
                  <th style={{ padding: '8px 4px', color: 'var(--text-muted)', fontWeight: '600' }}>ID</th>
                  <th style={{ padding: '8px 4px', color: 'var(--text-muted)', fontWeight: '600' }}>Issue</th>
                  <th style={{ padding: '8px 4px', color: 'var(--text-muted)', fontWeight: '600' }}>Location</th>
                  <th style={{ padding: '8px 4px', color: 'var(--text-muted)', fontWeight: '600' }}>Priority</th>
                  <th style={{ padding: '8px 4px', color: 'var(--text-muted)', fontWeight: '600' }}>Department</th>
                  <th style={{ padding: '8px 4px', color: 'var(--text-muted)', fontWeight: '600' }}>SLA Timer</th>
                  <th style={{ padding: '8px 4px', color: 'var(--text-muted)', fontWeight: '600', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {priorityQueue.map((ticket) => {
                  const isCritical = ticket.urgency?.toLowerCase() === 'critical' || ticket.urgency?.toLowerCase() === 'high';
                  
                  return (
                    <tr key={ticket.id} style={{ borderBottom: '1px solid rgba(231,214,201,0.4)', transition: 'background 0.2s', cursor: 'pointer' }} onClick={() => onSelectTicket(ticket.id)}>
                      <td style={{ padding: '10px 4px', fontWeight: '500', color: 'var(--text-muted)' }}>#{ticket.id.toString().slice(-4)}</td>
                      <td style={{ padding: '10px 4px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{ticket.title}</span>
                          {ticket.duplicateOfId && (
                            <span style={{ fontSize: '9px', color: '#B9654B', background: 'rgba(185,101,75,0.08)', padding: '1px 4px', borderRadius: '2px', alignSelf: 'flex-start', marginTop: '2px' }}>Possible Duplicate</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '10px 4px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={10} className="text-cyan" />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{ticket.location}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 4px' }}>
                        <span style={{ 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          fontSize: '10px', 
                          fontWeight: '700',
                          background: isCritical ? 'rgba(185, 101, 75, 0.08)' : 'rgba(82, 106, 120, 0.08)',
                          color: isCritical ? '#B9654B' : '#526A78',
                          border: isCritical ? '1px solid rgba(185,101,75,0.2)' : '1px solid rgba(82,106,120,0.2)'
                        }}>
                          {ticket.urgency || 'Medium'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 4px', color: 'var(--text-secondary)' }}>{ticket.category?.split(' & ')[0]}</td>
                      <td style={{ padding: '10px 4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} className={ticket.isSlaDelayed ? 'text-red' : 'text-muted'} />
                          <span style={{ color: ticket.isSlaDelayed ? '#B9654B' : 'var(--text-secondary)', fontWeight: ticket.isSlaDelayed ? '600' : '400' }}>
                            {ticket.timeElapsedStr}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onSelectTicket(ticket.id); }}
                          style={{ padding: '4px 8px', background: 'none', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '11px', cursor: 'pointer' }}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. AI Copilot Summary */}
      <div className="list-card-wrapper" style={{ padding: '20px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} className="text-cyan animate-pulse-fast" />
          <span>Gemini Civic Co-pilot Operations Feed</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {insights.map((insight, idx) => (
            <div key={idx} style={{ padding: '12px', background: 'var(--surface-elevated)', borderRadius: '4px', borderLeft: '3.5px solid var(--accent-cyan)' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{insight.message}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>{insight.desc}</p>
            </div>
          ))}
        </div>
        <button 
          onClick={() => onNavigateToTab('copilot')}
          className="btn btn-primary"
          style={{ marginTop: '16px', fontSize: '12px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <span>Open Advisor Console</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* 7. Analytics Summary Preview */}
      <div className="list-card-wrapper" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={16} className="text-cyan" />
            <span>Platform Performance Analytics</span>
          </h3>
          <button 
            onClick={() => onNavigateToTab('analytics')}
            style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
          >
            <span>Full Insights</span>
            <ArrowRight size={12} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'var(--surface-elevated)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Resolution Rate</span>
            <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginTop: '4px' }}>
              {complaints.length > 0 ? Math.round((complaints.filter(c => c.status === 'Resolved').length / complaints.length) * 100) : 0}%
            </span>
          </div>
          <div style={{ padding: '12px', background: 'var(--surface-elevated)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Operational SLA Triage Compliance</span>
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#2e7d32', display: 'block', marginTop: '4px' }}>94.2%</span>
          </div>
          <div style={{ padding: '12px', background: 'var(--surface-elevated)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Active SLA Warnings</span>
            <span style={{ fontSize: '20px', fontWeight: '700', color: complaints.filter(c => c.isSlaDelayed).length > 0 ? '#B9654B' : 'var(--text-primary)', display: 'block', marginTop: '4px' }}>
              {complaints.filter(c => c.isSlaDelayed).length} cases
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
