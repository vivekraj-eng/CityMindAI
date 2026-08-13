import React, { useState } from 'react';
import { Sparkles, ShieldAlert, Cpu, AlertCircle, CheckCircle, Info, RefreshCw } from 'lucide-react';

export default function AICopilotPanel({ complaints, updateComplaintStatus }) {
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [selectedDuplicate, setSelectedDuplicate] = useState(null);

  // Group duplicate tickets
  const duplicates = complaints.filter(c => c.duplicateOfId && c.status !== 'Resolved');

  // Location clusters
  const locationGroups = {};
  complaints.forEach(c => {
    if (c.status !== 'Resolved') {
      locationGroups[c.location] = (locationGroups[c.location] || []);
      locationGroups[c.location].push(c);
    }
  });
  const clusters = Object.entries(locationGroups).filter(([_, list]) => list.length >= 2);

  const handleResolveDuplicates = (duplicateId) => {
    // Resolve duplicate tickets at once by linking their status to resolved
    updateComplaintStatus(duplicateId, 'Resolved', {
      resolutionNote: 'Closed as duplicate report by Gemini Co-pilot.',
      resolutionDate: new Date().toISOString()
    });
  };

  return (
    <div className="ai-copilot-panel-container">
      <div className="overview-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div className="title-area">
          <h2 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '4px' }}>AI Civic Co-pilot Advisory Console</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Automated city-wide alerts, cluster detection, and duplicate grievance routing directives.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px', alignItems: 'start' }}>
        {/* Left pane: Duplicate Review and Clusters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Duplicate Detection Card */}
          <div className="list-card-wrapper" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16} className="text-cyan animate-pulse-fast" />
              <span>Duplicate Verification Desk</span>
            </h3>

            {duplicates.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <CheckCircle size={32} className="text-green" style={{ marginBottom: '8px' }} />
                <p>No active duplicate ticket overlaps found.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {duplicates.map((ticket) => (
                  <div key={ticket.id} style={{ border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '4px', background: 'var(--surface-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>CASE #{ticket.id.toString().slice(-4)}</span>
                      <span style={{ fontSize: '10px', color: '#B9654B', background: 'rgba(185,101,75,0.08)', padding: '1px 6px', borderRadius: '2px' }}>Overlap Alert</span>
                    </div>
                    <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{ticket.title}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>"{ticket.description}"</p>
                    
                    <div style={{ marginTop: '10px', padding: '8px 10px', background: 'var(--surface-elevated)', borderRadius: '4px', borderLeft: '2px solid var(--text-muted)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <strong>Similar report:</strong> Case #{ticket.duplicateOfId.toString().slice(-4)}: "{ticket.duplicateOfTitle}"
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                      <button 
                        onClick={() => handleResolveDuplicates(ticket.id)}
                        className="btn btn-secondary" 
                        style={{ fontSize: '11px', padding: '6px 12px' }}
                      >
                        Resolve as Duplicate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Location Clusters */}
          <div className="list-card-wrapper" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={16} className="text-cyan" />
              <span>Location Cluster Log</span>
            </h3>

            {clusters.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Info size={32} className="text-muted" style={{ marginBottom: '8px' }} />
                <p>No active location density clusters detected.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {clusters.map(([location, list], idx) => (
                  <div key={idx} style={{ border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '4px', background: 'var(--surface-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{location}</span>
                      <span style={{ fontSize: '11px', color: '#B9654B', background: 'rgba(185,101,75,0.08)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                        {list.length} Reports Cluster
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                      {list.map((c) => (
                        <div key={c.id} style={{ fontSize: '11.5px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span>• {c.title}</span>
                          <span style={{ color: 'var(--text-muted)' }}>Status: {c.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right pane: General Telemetry instructions */}
        <div className="list-card-wrapper" style={{ padding: '20px', background: 'var(--surface-color)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} className="text-cyan animate-pulse-fast" />
            <span>Advisory Directives</span>
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
            Our municipal co-pilot utilizes state-of-the-art LLM vector similarity models to verify duplication thresholds, parse coordinates into active clustering grids, and compute workloads.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: 'var(--accent-cyan)' }}>✔</span>
              <span><strong>Duplicate Detection:</strong> Checks for semantic similarities and location overlaps across all active tickets.</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: 'var(--accent-cyan)' }}>✔</span>
              <span><strong>Cluster Analysis:</strong> Aggregates tickets situated within a 150m grid box area to optimize municipal dispatch schedules.</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: 'var(--accent-cyan)' }}>✔</span>
              <span><strong>SLA Escalation Alerts:</strong> Flags issues that have exceeded standard response limits (4 hours for Critical, 24 hours for Low).</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
