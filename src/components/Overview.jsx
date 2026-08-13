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
  ArrowRight
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

  // Department Workloads helper
  const departments = [
    { name: 'Roads & Infrastructure', key: 'Roads', workload: 68 },
    { name: 'Water & Sanitation', key: 'Sanitation', workload: 42 },
    { name: 'Public Safety', key: 'Safety', workload: 27 },
    { name: 'Waste Management', key: 'Waste', workload: 54 },
    { name: 'Lighting & Electricity', key: 'Electrical', workload: 31 }
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

    // 1. Cluster check (multiple complaints in same location)
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
    } else {
      insights.push({
        type: 'cluster',
        message: 'No spatial grievance clusters detected in the last 24h.',
        desc: 'Incidents are distributed across separate grid sectors.'
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

    // 4. Duplicate checks
    const duplicateCount = complaints.filter(c => c.duplicateOfId).length;
    if (duplicateCount > 0) {
      insights.push({
        type: 'duplicate',
        message: `${duplicateCount} possible duplicate grievances flagged by Gemini similarity scan.`,
        desc: 'Inspect overlapping details before creating new response dispatches.'
      });
    }

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
    <div className="overview-container">
      {/* Overview Header */}
      <div className="overview-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div className="title-area">
          <h2 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '4px' }}>Civic Intelligence</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Real-time overview of your city's active issues.</p>
        </div>
        <div className="date-status-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '12px' }}>
          <span className="dot dot-green" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#2e7d32' }}></span>
          <span style={{ color: 'var(--text-secondary)' }}>Command Center Live</span>
          <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="metrics-banner-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
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

      {/* Main Workspace Layout */}
      <div className="overview-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Hand side: Priority Queue */}
        <div className="overview-pane-left">
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
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
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
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>{ticket.location}</span>
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
        </div>

        {/* Right Hand side: AI Co-pilot Insights & Department workloads */}
        <div className="overview-pane-right">
          
          {/* AI Civic Co-pilot Panel */}
          <div className="list-card-wrapper" style={{ padding: '20px', marginBottom: '24px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} className="text-cyan animate-pulse-fast" />
              <span>Gemini Civic Co-pilot</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {insights.map((insight, idx) => (
                <div key={idx} style={{ padding: '10px 12px', background: 'var(--surface-elevated)', borderRadius: '4px', borderLeft: '3px solid var(--accent-cyan)' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>{insight.message}</p>
                  <p style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>{insight.desc}</p>
                </div>
              ))}
            </div>

            <button 
              onClick={() => onNavigateToTab('copilot')}
              className="btn btn-primary w-full"
              style={{ marginTop: '16px', fontSize: '12px', padding: '8px 12px' }}
            >
              <span>Review Advisory Console</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Department Workload */}
          <div className="list-card-wrapper" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={16} className="text-cyan" />
              <span>Department Workload</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {departments.map((dept, idx) => {
                const countActive = complaints.filter(c => c.category === dept.name && c.status !== 'Resolved').length;
                const workloadPercent = getWorkloadPercentage(dept.name);
                
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{dept.key}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{countActive} active ({workloadPercent}%)</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ height: '100%', width: `${Math.max(4, workloadPercent)}%`, background: 'var(--accent-cyan)', borderRadius: '3px' }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
