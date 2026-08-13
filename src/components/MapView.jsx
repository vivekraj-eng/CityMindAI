import React, { useState } from 'react';
import { 
  MapPin, 
  Info, 
  X, 
  AlertTriangle, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  Layers, 
  Filter, 
  ExternalLink 
} from 'lucide-react';

export default function MapView({ complaints, onSelectTicket }) {
  const [activePin, setActivePin] = useState(null);
  
  // 3 Dropdown filters
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Interactive Map Settings
  const [zoomLevel, setZoomLevel] = useState(100); // 75 | 100 | 125 | 150 | 200
  const [isHeatmapEnabled, setIsHeatmapEnabled] = useState(false);
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list'

  // Hardcoded coordinate placement generator based on ID
  const getCoordinates = (id) => {
    const xBase = (id % 100) / 100;
    const yBase = ((id / 100) % 100) / 100;
    const x = Math.round(15 + xBase * 70);
    const y = Math.round(15 + yBase * 70);
    return { x, y };
  };

  const mapComplaints = complaints.map(c => {
    const coords = getCoordinates(c.id);
    return { ...c, ...coords };
  });

  const filteredMapComplaints = mapComplaints.filter(c => {
    const matchesPriority = filterPriority === 'All' || c.urgency?.toLowerCase() === filterPriority.toLowerCase();
    const matchesDept = filterDept === 'All' || c.category === filterDept;
    const matchesStatus = filterStatus === 'All' || c.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesPriority && matchesDept && matchesStatus;
  });

  // Calculate high-density zones for Heatmap rendering
  const getHeatmapClusters = () => {
    // If coordinates are within 10% delta of each other, group them
    const densityPoints = [];
    filteredMapComplaints.forEach(c => {
      const existing = densityPoints.find(p => Math.abs(p.x - c.x) < 8 && Math.abs(p.y - c.y) < 8);
      if (existing) {
        existing.weight += 1;
      } else {
        densityPoints.push({ x: c.x, y: c.y, weight: 1 });
      }
    });
    return densityPoints;
  };

  const heatmapPoints = getHeatmapClusters();

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 75));
  };

  const handleResetLocate = () => {
    setZoomLevel(100);
    setActivePin(null);
  };

  return (
    <div className="map-view-component">
      
      {/* Map Header containing filters */}
      <div className="map-header" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div className="map-title-block" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '6px', background: 'rgba(185, 101, 75, 0.08)', borderRadius: '6px', color: 'var(--accent-cyan)' }}>
              <Compass size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Command Center Live Map</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Spatial telemetry and dispatch node hot-spots.</p>
            </div>
          </div>

          {/* View Toggles & Map Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
              style={{ padding: '6px 12px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '600' }}
            >
              Show {viewMode === 'map' ? 'Grievance Table' : 'Radar Grid Map'}
            </button>

            <button
              onClick={() => setIsHeatmapEnabled(!isHeatmapEnabled)}
              style={{
                padding: '6px 12px',
                background: isHeatmapEnabled ? 'rgba(185, 101, 75, 0.08)' : 'var(--surface-color)',
                border: isHeatmapEnabled ? '1px solid rgba(185, 101, 75, 0.3)' : '1px solid var(--glass-border)',
                borderRadius: '4px',
                fontSize: '12px',
                color: isHeatmapEnabled ? '#B9654B' : 'var(--text-primary)',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Layers size={12} />
              <span>Heatmap {isHeatmapEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* 3 Selectors Row */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', background: 'var(--surface-color)', padding: '12px', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
            <Filter size={12} />
            <span>Filters:</span>
          </div>

          {/* Priority */}
          <select 
            value={filterPriority} 
            onChange={(e) => { setFilterPriority(e.target.value); setActivePin(null); }}
            style={{ padding: '4px 10px', background: 'var(--surface-elevated)', border: '1px solid var(--glass-border)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-primary)' }}
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Department */}
          <select 
            value={filterDept} 
            onChange={(e) => { setFilterDept(e.target.value); setActivePin(null); }}
            style={{ padding: '4px 10px', background: 'var(--surface-elevated)', border: '1px solid var(--glass-border)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-primary)' }}
          >
            <option value="All">All Departments</option>
            <option value="Roads & Infrastructure">Roads & Infrastructure</option>
            <option value="Water & Sanitation">Water & Sanitation</option>
            <option value="Public Safety">Public Safety</option>
            <option value="Waste Management">Waste Management</option>
            <option value="Lighting & Electricity">Lighting & Electricity</option>
          </select>

          {/* Status */}
          <select 
            value={filterStatus} 
            onChange={(e) => { setFilterStatus(e.target.value); setActivePin(null); }}
            style={{ padding: '4px 10px', background: 'var(--surface-elevated)', border: '1px solid var(--glass-border)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-primary)' }}
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="AI Analyzed">AI Analyzed</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {viewMode === 'map' ? (
        <div className="map-workspace-grid">
          {/* Abstract City Grid Canvas */}
          <div className="map-canvas-card" style={{ overflow: 'hidden', position: 'relative' }}>
            
            {/* Custom Map Navigation Controls */}
            <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: '20', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={handleZoomIn}
                style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--surface-color)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button 
                onClick={handleZoomOut}
                style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--surface-color)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <button 
                onClick={handleResetLocate}
                style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--surface-color)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                title="Reset View"
              >
                1:1
              </button>
            </div>

            <div 
              className="abstract-map-canvas"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'center center',
                transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* Grid Lines */}
              <div className="map-grid-overlay"></div>
              
              {/* Streets SVG */}
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="map-svg-grid">
                <line x1="20" y1="0" x2="20" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                <line x1="80" y1="0" x2="80" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                <line x1="0" y1="65" x2="100" y2="65" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                <path d="M 0,90 Q 30,70 70,50 T 100,10" fill="none" stroke="rgba(6, 182, 212, 0.05)" strokeWidth="1.5" />
              </svg>

              {/* Heatmap Layer Overlays */}
              {isHeatmapEnabled && heatmapPoints.map((point, idx) => (
                <div 
                  key={`heat-${idx}`}
                  style={{
                    position: 'absolute',
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: `${40 + point.weight * 20}px`,
                    height: `${40 + point.weight * 20}px`,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(185,101,75,0.4) 0%, rgba(185,101,75,0.1) 50%, transparent 100%)',
                    pointerEvents: 'none',
                    zIndex: '5'
                  }}
                />
              ))}

              {/* Glowing Hotspot Pins */}
              {filteredMapComplaints.map((pin) => {
                let colorTheme = '#526A78'; // Low/default -> Blue-gray
                if (pin.status === 'Resolved') {
                  colorTheme = '#2e7d32'; // Resolved -> green
                } else if (pin.urgency?.toLowerCase() === 'critical') {
                  colorTheme = '#B9654B'; // Critical -> terracotta
                } else if (pin.urgency?.toLowerCase() === 'high') {
                  colorTheme = '#d97706'; // High -> orange/amber
                } else if (pin.urgency?.toLowerCase() === 'medium') {
                  colorTheme = '#3b82f6'; // Medium -> blue
                }

                return (
                  <button
                    key={pin.id}
                    className={`map-pin-node ${activePin?.id === pin.id ? 'is-active' : ''}`}
                    style={{ 
                      left: `${pin.x}%`, 
                      top: `${pin.y}%`,
                      '--pin-color': colorTheme,
                      zIndex: activePin?.id === pin.id ? '25' : '10'
                    }}
                    onClick={() => setActivePin(pin)}
                  >
                    <span className="pin-pulse" style={{ animationDelay: `${pin.id % 4 * 0.5}s` }}></span>
                    <span className="pin-dot"></span>
                  </button>
                );
              })}

              {/* Pin Info Popover Window */}
              {activePin && (
                <div 
                  className="map-info-popover"
                  style={{ 
                    left: `${activePin.x}%`, 
                    top: `${activePin.y > 50 ? activePin.y - 30 : activePin.y + 4}%`,
                    zIndex: '30'
                  }}
                >
                  <div className="popover-header">
                    <span className="popover-cat">{activePin.category}</span>
                    <button className="popover-close" onClick={() => setActivePin(null)}>
                      <X size={12} />
                    </button>
                  </div>
                  <div className="popover-body">
                    <h4 className="popover-title">{activePin.title}</h4>
                    <div className="popover-item">
                      <MapPin size={10} className="text-cyan" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activePin.location}</span>
                    </div>
                    
                    <div className="popover-footer-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <span className={`popover-urgency-badge urgency-${activePin.urgency?.toLowerCase()}`}>
                        {activePin.urgency}
                      </span>
                      <button 
                        onClick={() => {
                          if (onSelectTicket) onSelectTicket(activePin.id);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: 'none',
                          background: 'none',
                          color: 'var(--accent-cyan)',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        <span>Open complaint</span>
                        <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Spatial legend */}
          <div className="map-legend-card">
            <h4>Command Map Legend</h4>
            <div className="legend-items">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#B9654B' }}></span>
                <div className="legend-text">
                  <span className="legend-name">Critical Telemetry Node</span>
                  <span className="legend-desc">Safety hazard or utility failure.</span>
                </div>
              </div>
              
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#d97706' }}></span>
                <div className="legend-text">
                  <span className="legend-name">High Priority Node</span>
                  <span className="legend-desc">Engineering repair scheduled.</span>
                </div>
              </div>

              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#3b82f6' }}></span>
                <div className="legend-text">
                  <span className="legend-name">Medium Node</span>
                  <span className="legend-desc">General infrastructure request.</span>
                </div>
              </div>

              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#2e7d32' }}></span>
                <div className="legend-text">
                  <span className="legend-name">Resolved Case Node</span>
                  <span className="legend-desc">Confirmed municipal completion.</span>
                </div>
              </div>
            </div>

            <div className="map-instructions-box">
              <Info size={16} className="text-cyan" />
              <p>Click on any pulsing node marker inside the grid map to display coordinates, urgency indicators, and dispatch details.</p>
            </div>
          </div>
        </div>
      ) : (
        /* Grievance Table View */
        <div className="list-card-wrapper" style={{ padding: '20px' }}>
          {filteredMapComplaints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
              <AlertTriangle size={36} className="text-muted" style={{ marginBottom: '12px' }} />
              <p>No complaints match active radar grid filter parameters.</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
                    <th style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>Case ID</th>
                    <th style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>Issue Title</th>
                    <th style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>Location</th>
                    <th style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>Priority</th>
                    <th style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>Department</th>
                    <th style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '8px 4px', color: 'var(--text-muted)', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMapComplaints.map((ticket) => (
                    <tr key={ticket.id} style={{ borderBottom: '1px solid rgba(231,214,201,0.3)' }}>
                      <td style={{ padding: '10px 4px', color: 'var(--text-muted)' }}>#{ticket.id.toString().slice(-6)}</td>
                      <td style={{ padding: '10px 4px', fontWeight: '600', color: 'var(--text-primary)' }}>{ticket.title}</td>
                      <td style={{ padding: '10px 4px', color: 'var(--text-secondary)' }}>{ticket.location}</td>
                      <td style={{ padding: '10px 4px' }}>
                        <span className={`popover-urgency-badge urgency-${ticket.urgency?.toLowerCase()}`}>
                          {ticket.urgency}
                        </span>
                      </td>
                      <td style={{ padding: '10px 4px', color: 'var(--text-secondary)' }}>{ticket.category}</td>
                      <td style={{ padding: '10px 4px', color: 'var(--text-secondary)' }}>{ticket.status}</td>
                      <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                        <button 
                          onClick={() => {
                            if (onSelectTicket) onSelectTicket(ticket.id);
                          }}
                          style={{ padding: '4px 8px', background: 'none', border: '1px solid var(--glass-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
