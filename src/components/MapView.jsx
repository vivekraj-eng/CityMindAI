import React from 'react';
import { Map, ExternalLink, Info } from 'lucide-react';

export default function MapView() {
  return (
    <div 
      className="map-view-component" 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '480px', 
        width: '100%', 
        padding: '24px' 
      }}
    >
      <div 
        className="list-card-wrapper" 
        style={{ 
          width: '100%', 
          maxWidth: '520px', 
          padding: '40px', 
          textAlign: 'center', 
          background: 'var(--surface-color)', 
          border: '1px solid var(--glass-border)', 
          borderRadius: '8px', 
          boxShadow: '0 4px 24px rgba(185,101,75,0.02)' 
        }}
      >
        <div 
          style={{ 
            display: 'inline-flex', 
            padding: '18px', 
            background: 'rgba(185, 101, 75, 0.08)', 
            borderRadius: '50%', 
            color: 'var(--accent-cyan)', 
            marginBottom: '24px' 
          }}
        >
          <Map size={36} />
        </div>

        <h3 
          style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: 'var(--text-primary)', 
            marginBottom: '12px', 
            fontFamily: 'var(--font-heading)' 
          }}
        >
          Live Civic Map Workspace
        </h3>

        <p 
          style={{ 
            fontSize: '13.5px', 
            color: 'var(--text-secondary)', 
            lineHeight: '1.6', 
            marginBottom: '28px' 
          }}
        >
          CityMindAI coordinates municipal routing and area hotspots using standard latitude and longitude metadata. You can view, search, and navigate through all local reports directly in the Google Maps workspace.
        </p>

        <a 
          href="https://www.google.com/maps/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-primary"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '12px 24px', 
            fontSize: '13.5px', 
            fontWeight: '600', 
            margin: '0 auto', 
            textDecoration: 'none' 
          }}
        >
          <span>Open Google Maps</span>
          <ExternalLink size={14} />
        </a>

        <div 
          style={{ 
            marginTop: '32px', 
            display: 'flex', 
            gap: '10px', 
            padding: '14px', 
            background: 'var(--surface-elevated)', 
            borderRadius: '6px', 
            border: '1px solid var(--glass-border)', 
            fontSize: '12px', 
            color: 'var(--text-secondary)', 
            textAlign: 'left' 
          }}
        >
          <Info size={16} className="text-cyan" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ margin: 0, lineHeight: '1.4' }}>
            Latitude/longitude variables are automatically derived from addresses using our geocoder pipelines and attached directly to the routing data.
          </p>
        </div>
      </div>
    </div>
  );
}
