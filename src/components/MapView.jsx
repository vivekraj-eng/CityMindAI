import React, { useState } from 'react';
import { MapPin, Info, X, AlertTriangle } from 'lucide-react';

export default function MapView({ complaints }) {
  const [activePin, setActivePin] = useState(null);
  const [mapFilter, setMapFilter] = useState('All');

  // Hardcoded coordinate placement generator based on ID to scatter pins across the abstract city canvas
  const getCoordinates = (id) => {
    // Deterministic random numbers
    const xBase = (id % 100) / 100;
    const yBase = ((id / 100) % 100) / 100;
    
    // Scale coordinates between 15% and 85% to stay safely on map canvas
    const x = Math.round(15 + xBase * 70);
    const y = Math.round(15 + yBase * 70);
    return { x, y };
  };

  const mapComplaints = complaints.map(c => {
    const coords = getCoordinates(c.id);
    return { ...c, ...coords };
  });

  const filteredMapComplaints = mapComplaints.filter(c => {
    return (mapFilter === 'All' || c.category === mapFilter) && c.status !== 'Resolved';
  });

  return (
    <div className="map-view-component">
      <div className="map-header">
        <div className="map-title-block">
          <h3>Incident Hotspot Map</h3>
          <p>Real-time spatial distribution of active unresolved grievances. Glowing nodes indicate incident density.</p>
        </div>
        
        {/* Category filtering */}
        <select 
          value={mapFilter} 
          onChange={(e) => { setMapFilter(e.target.value); setActivePin(null); }}
          className="map-filter-dropdown"
        >
          <option value="All">All Categories</option>
          <option value="Roads & Infrastructure">Roads & Infrastructure</option>
          <option value="Water & Sanitation">Water & Sanitation</option>
          <option value="Public Safety">Public Safety</option>
          <option value="Waste Management">Waste Management</option>
          <option value="Lighting & Electricity">Lighting & Electricity</option>
        </select>
      </div>

      <div className="map-workspace-grid">
        {/* Abstract City Grid Canvas */}
        <div className="map-canvas-card">
          <div className="abstract-map-canvas">
            {/* Grid Lines */}
            <div className="map-grid-overlay"></div>
            
            {/* Streets SVG */}
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="map-svg-grid">
              {/* Abstract Roads Grid */}
              <line x1="20" y1="0" x2="20" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="80" y1="0" x2="80" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="0" y1="65" x2="100" y2="65" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              
              {/* Diagonals / Rivers */}
              <path d="M 0,90 Q 30,70 70,50 T 100,10" fill="none" stroke="rgba(6, 182, 212, 0.05)" strokeWidth="1.5" />
            </svg>

            {/* Glowing Hotspot Pins */}
            {filteredMapComplaints.map((pin) => {
              const colorTheme = pin.urgency === 'High' || pin.urgency === 'Critical' 
                ? '#ef4444' 
                : pin.urgency === 'Medium' 
                  ? '#eab308' 
                  : '#3b82f6';

              return (
                <button
                  key={pin.id}
                  className={`map-pin-node ${activePin?.id === pin.id ? 'is-active' : ''}`}
                  style={{ 
                    left: `${pin.x}%`, 
                    top: `${pin.y}%`,
                    '--pin-color': colorTheme
                  }}
                  onClick={() => setActivePin(pin)}
                >
                  <span className="pin-pulse"></span>
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
                  top: `${activePin.y > 50 ? activePin.y - 28 : activePin.y + 4}%`
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
                    <span>{activePin.location}</span>
                  </div>
                  <div className="popover-footer-row">
                    <span className={`popover-urgency-badge urgency-${activePin.urgency?.toLowerCase()}`}>
                      {activePin.urgency}
                    </span>
                    <span className="popover-status">{activePin.status}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Spatial legend / details panel */}
        <div className="map-legend-card">
          <h4>Command Map Legend</h4>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-dot dot-red"></span>
              <div className="legend-text">
                <span className="legend-name">Critical Response Node</span>
                <span className="legend-desc">High urgency safety hazard or utility failure.</span>
              </div>
            </div>
            
            <div className="legend-item">
              <span className="legend-dot dot-yellow"></span>
              <div className="legend-text">
                <span className="legend-name">Active Action Node</span>
                <span className="legend-desc">Medium priority infrastructure repair.</span>
              </div>
            </div>

            <div className="legend-item">
              <span className="legend-dot dot-blue"></span>
              <div className="legend-text">
                <span className="legend-name">Standard Node</span>
                <span className="legend-desc">Low priority general cleanup or lighting ticket.</span>
              </div>
            </div>
          </div>

          <div className="map-instructions-box">
            <Info size={16} className="text-cyan" />
            <p>Click on any pulsing radar marker node inside the city grid map to display spatial coordinates, hazard telemetry, and dispatch details.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
