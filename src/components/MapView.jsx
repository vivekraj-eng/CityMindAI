import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Info, 
  X, 
  AlertTriangle, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  Filter, 
  ExternalLink,
  Search,
  Navigation
} from 'lucide-react';

export default function MapView({ complaints, onSelectTicket }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [apiLoadError, setApiLoadError] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Global listener for Google Maps Authentication Errors & Load timeouts
  useEffect(() => {
    window.gm_authFailure = () => {
      setAuthError(true);
    };

    const timer = setTimeout(() => {
      if (!window.google) {
        setApiLoadError(true);
      }
    }, 6000);

    return () => {
      clearTimeout(timer);
      window.gm_authFailure = null;
    };
  }, []);

  // Render setup fallback state if API key is missing or loaded scripts failed
  if (!apiKey || apiLoadError || authError) {
    let errorTitle = "Google Maps API Key Missing";
    let errorDesc = "Please define VITE_GOOGLE_MAPS_API_KEY in your .env.local file to initialize the Live Geographic Map.";
    
    if (authError) {
      errorTitle = "Google Maps Authentication Failed";
      errorDesc = "The provided API key is invalid or lacks the required Google Maps JavaScript API permissions. Check Cloud Console restrictions.";
    } else if (apiLoadError) {
      errorTitle = "Google Maps API Timeout";
      errorDesc = "The Google Maps script failed to load within 6 seconds. Verify your internet connection or check browser console logs.";
    }

    return (
      <div 
        className="map-unavailable-container" 
        style={{ 
          padding: '48px 32px', 
          background: 'var(--surface-color)', 
          border: '1px solid var(--glass-border)', 
          borderRadius: '8px', 
          textAlign: 'center', 
          margin: '24px 0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(185, 101, 75, 0.08)', borderRadius: '50%', color: '#B9654B', marginBottom: '20px' }}>
          <AlertTriangle size={40} />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
          {errorTitle}
        </h3>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto 24px auto', lineHeight: '1.5' }}>
          {errorDesc}
        </p>
        {!authError && !apiLoadError && (
          <div style={{ background: 'var(--surface-elevated)', padding: '12px 16px', borderRadius: '6px', display: 'inline-block', border: '1px solid var(--glass-border)', fontSize: '12px', color: 'var(--text-muted)' }}>
            <code>VITE_GOOGLE_MAPS_API_KEY=AIzaSyYourKeyHere</code>
          </div>
        )}
      </div>
    );
  }

  // --- Real Google Map Core Code ---
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const currentLocationMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);

  const [isApiLoaded, setIsApiLoaded] = useState(() => {
    return !!(window.google && window.google.maps && window.google.maps.Geocoder && window.google.maps.Map);
  });
  const [geocodedComplaints, setGeocodedComplaints] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [activePin, setActivePin] = useState(null);
  
  // Dynamic Map state trackers
  const [mapZoom, setMapZoom] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [locateError, setLocateError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Filters State
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list'

  // Poll for global script load injected in App.jsx
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.Geocoder && window.google.maps.Map) return;
    const interval = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.Geocoder && window.google.maps.Map) {
        setIsApiLoaded(true);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Geocode addresses of complaints that lack real coords on load
  useEffect(() => {
    if (!isApiLoaded || !window.google || !window.google.maps || !window.google.maps.Geocoder) return;
    let isMounted = true;

    const geocodeRecords = async () => {
      setIsGeocoding(true);
      const geocoder = new window.google.maps.Geocoder();

      const resolved = await Promise.all(
        complaints.map(async (c) => {
          // If complaint already has stored coords from DB
          if (c.latitude !== undefined && c.latitude !== null && c.latitude !== '') {
            const parsedLat = parseFloat(c.latitude);
            const parsedLng = parseFloat(c.longitude);
            if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
              return { ...c, lat: parsedLat, lng: parsedLng };
            }
          }

          // If text only, geocode using Google Maps API (Do NOT generate fake coords)
          try {
            const coords = await new Promise((resolve) => {
              geocoder.geocode({ address: c.location }, (results, status) => {
                if (status === 'OK' && results[0]) {
                  const loc = results[0].geometry.location;
                  resolve({ lat: loc.lat(), lng: loc.lng() });
                } else {
                  resolve(null);
                }
              });
            });
            if (coords) {
              return { ...c, lat: coords.lat, lng: coords.lng };
            }
          } catch (err) {
            console.warn("Geocoding failed for address:", c.location, err);
          }

          return { ...c, lat: null, lng: null };
        })
      );

      if (isMounted) {
        setGeocodedComplaints(resolved);
        setIsGeocoding(false);
      }
    };

    geocodeRecords();
    return () => {
      isMounted = false;
    };
  }, [complaints, isApiLoaded]);

  // Initialize Map Instance
  useEffect(() => {
    if (!isApiLoaded || !mapRef.current || mapInstanceRef.current || !window.google || !window.google.maps || !window.google.maps.Map) return;

    // Center map around a default city coordinate (e.g. New York Center)
    const defaultCenter = { lat: 40.7128, lng: -74.0060 };

    const map = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 12,
      maxZoom: 19,
      minZoom: 3,
      mapTypeControl: true,
      fullscreenControl: false,
      streetViewControl: false,
      styles: [
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#e9edf0" }]
        },
        {
          featureType: "landscape",
          elementType: "geometry",
          stylers: [{ color: "#f7f5f2" }]
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#ffffff" }]
        },
        {
          featureType: "poi",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    mapInstanceRef.current = map;

    // Track map zoom dynamically to trigger clustering recalculations
    const zoomListener = map.addListener('zoom_changed', () => {
      setMapZoom(map.getZoom());
    });

    return () => {
      if (zoomListener && typeof zoomListener.remove === 'function') {
        zoomListener.remove();
      } else if (window.google && window.google.maps && window.google.maps.event) {
        window.google.maps.event.removeListener(zoomListener);
      }
      mapInstanceRef.current = null;
    };
  }, [isApiLoaded]);

  // Multi-Dropdown Filter matching
  const filteredComplaints = geocodedComplaints.filter((c) => {
    const matchesPriority = filterPriority === 'All' || c.urgency?.toLowerCase() === filterPriority.toLowerCase();
    const matchesDept = filterDept === 'All' || (c.category || '').split(' & ')[0].toLowerCase().includes(filterDept.toLowerCase());
    const matchesStatus = filterStatus === 'All' || c.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesPriority && matchesDept && matchesStatus;
  });

  // Calculate In-Memory Clusters based on Zoom Level distance thresholds
  const getClusters = (list, zoom) => {
    const gridSize = 180 / Math.pow(2, zoom + 2); // Dynamic grid bounds
    const clusters = [];

    list.forEach((c) => {
      if (c.lat === null || c.lng === null) return;

      let added = false;
      for (let cluster of clusters) {
        const dLat = Math.abs(cluster.center.lat - c.lat);
        const dLng = Math.abs(cluster.center.lng - c.lng);
        if (dLat < gridSize && dLng < gridSize) {
          cluster.tickets.push(c);
          // Update cluster centroid
          cluster.center.lat = (cluster.center.lat * (cluster.tickets.length - 1) + c.lat) / cluster.tickets.length;
          cluster.center.lng = (cluster.center.lng * (cluster.tickets.length - 1) + c.lng) / cluster.tickets.length;
          added = true;
          break;
        }
      }

      if (!added) {
        clusters.push({
          center: { lat: c.lat, lng: c.lng },
          tickets: [c]
        });
      }
    });

    return clusters;
  };

  // Re-draw Markers & Clusters whenever map constraints or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // 1. Clear previous markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // 2. Fetch clusters
    const clusters = getClusters(filteredComplaints, mapZoom);

    // 3. Render markers & clusters on map canvas
    clusters.forEach((cluster) => {
      const ticketCount = cluster.tickets.length;

      if (ticketCount === 1) {
        // Render single custom circular dot marker matching CityMindAI priority guidelines
        const ticket = cluster.tickets[0];
        
        let color = '#526A78'; // Low/default -> Blue-gray
        if (ticket.status?.toLowerCase() === 'resolved') {
          color = '#2e7d32'; // Muted green
        } else if (ticket.urgency?.toLowerCase() === 'critical') {
          color = '#B9654B'; // Terracotta red
        } else if (ticket.urgency?.toLowerCase() === 'high') {
          color = '#d97706'; // Orange/amber
        } else if (ticket.urgency?.toLowerCase() === 'medium') {
          color = '#3b82f6'; // Muted blue
        }

        const marker = new window.google.maps.Marker({
          position: cluster.center,
          map: mapInstanceRef.current,
          title: ticket.title,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: color,
            fillOpacity: 0.95,
            strokeColor: '#FFF9F4',
            strokeWeight: 1.5,
            scale: 8
          }
        });

        marker.addListener('click', () => {
          setActivePin(ticket);
        });

        markersRef.current.push(marker);
      } else {
        // Render cluster bubble marker with text label
        const clusterMarker = new window.google.maps.Marker({
          position: cluster.center,
          map: mapInstanceRef.current,
          label: {
            text: String(ticketCount),
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 'bold'
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#B9654B', // Terracotta cluster indicator
            fillOpacity: 0.85,
            strokeColor: '#FFF9F4',
            strokeWeight: 2,
            scale: 13
          }
        });

        clusterMarker.addListener('click', () => {
          const map = mapInstanceRef.current;
          map.setZoom(map.getZoom() + 2);
          map.setCenter(cluster.center);
        });

        markersRef.current.push(clusterMarker);
      }
    });

    // 4. Center map automatically on coordinates if first loading and centering is not yet set
    if (filteredComplaints.length > 0 && mapZoom === 12) {
      const valid = filteredComplaints.find(c => c.lat !== null);
      if (valid) {
        mapInstanceRef.current.setCenter({ lat: valid.lat, lng: valid.lng });
      }
    }
  }, [filteredComplaints, mapZoom, isApiLoaded]);

  // Geolocation centering tracker ("Locate Me")
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocateError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = position.coords;
        const pos = { lat: latitude, lng: longitude };

        const map = mapInstanceRef.current;
        if (map) {
          map.setCenter(pos);
          map.setZoom(15);
        }

        // Clean old current location elements
        if (currentLocationMarkerRef.current) currentLocationMarkerRef.current.setMap(null);
        if (accuracyCircleRef.current) accuracyCircleRef.current.setMap(null);

        // Draw fresh glowing cyan user dot
        currentLocationMarkerRef.current = new window.google.maps.Marker({
          position: pos,
          map,
          title: "Your Location",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#06b6d4', // Cyan user location
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 7
          }
        });

        // Add accuracy shadow circle overlay
        if (accuracy) {
          accuracyCircleRef.current = new window.google.maps.Circle({
            map,
            center: pos,
            radius: accuracy,
            fillColor: '#06b6d4',
            fillOpacity: 0.08,
            strokeColor: '#06b6d4',
            strokeOpacity: 0.25,
            strokeWeight: 1
          });
        }
      },
      (err) => {
        setIsLocating(false);
        setLocateError("Location access denied or timed out.");
        console.warn("Geolocation permission error:", err);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Address search query submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        const map = mapInstanceRef.current;
        if (map) {
          map.setCenter(loc);
          map.setZoom(14);
        }
        setActivePin(null);
      } else {
        setLocateError("Search address location not found.");
      }
    });
  };

  // Zoom helpers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1);
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1);
  };

  // Unmount Cleanup
  useEffect(() => {
    return () => {
      markersRef.current.forEach(m => m.setMap(null));
      if (currentLocationMarkerRef.current) currentLocationMarkerRef.current.setMap(null);
      if (accuracyCircleRef.current) accuracyCircleRef.current.setMap(null);
    };
  }, []);

  return (
    <div className="map-view-component">
      
      {/* Map Filter Controls row */}
      <div className="map-header" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div className="map-title-block" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '6px', background: 'rgba(185, 101, 75, 0.08)', borderRadius: '6px', color: 'var(--accent-cyan)' }}>
              <Compass size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)' }}>Interactive Geographic Map</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Real-time civic intelligence, dispatch zones, and telemetry overlays.</p>
            </div>
          </div>

          {/* Toggle radar/grid layout view */}
          <button 
            onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
            style={{ padding: '6px 12px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '600' }}
          >
            Show {viewMode === 'map' ? 'Grievance Table List' : 'Radar Map'}
          </button>
        </div>

        {/* Address Search & Geolocation locate panel */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: '1', maxWidth: '420px', position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search address or coordinate junction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 36px 8px 12px',
                borderRadius: '4px',
                border: '1px solid var(--glass-border)',
                background: 'var(--surface-color)',
                color: 'var(--text-primary)',
                fontSize: '12.5px'
              }}
            />
            <button 
              type="submit" 
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <Search size={14} />
            </button>
          </form>

          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            style={{
              padding: '8px 16px',
              background: 'var(--surface-color)',
              border: '1px solid var(--glass-border)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontSize: '12.5px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.2s'
            }}
          >
            <Navigation size={12} className={isLocating ? 'animate-pulse-fast text-cyan' : ''} />
            <span>{isLocating ? 'Locating...' : 'Locate Me'}</span>
          </button>

          {locateError && (
            <span style={{ fontSize: '12px', color: '#B9654B', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={12} /> {locateError}
            </span>
          )}

          {isGeocoding && (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Geocoding active tickets...
            </span>
          )}
        </div>

        {/* Dropdown Filters Row */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', background: 'var(--surface-color)', padding: '12px', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
            <Filter size={12} />
            <span>Filters:</span>
          </div>

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

          <select 
            value={filterDept} 
            onChange={(e) => { setFilterDept(e.target.value); setActivePin(null); }}
            style={{ padding: '4px 10px', background: 'var(--surface-elevated)', border: '1px solid var(--glass-border)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-primary)' }}
          >
            <option value="All">All Departments</option>
            <option value="Roads">Roads & Infrastructure</option>
            <option value="Water">Water & Sanitation</option>
            <option value="Safety">Public Safety</option>
            <option value="Waste">Waste Management</option>
            <option value="Electrical">Lighting & Electricity</option>
          </select>

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
        <div className="map-workspace-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Real Google Maps Container */}
          <div className="map-canvas-card" style={{ height: '480px', position: 'relative', overflow: 'hidden', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
            
            {/* Custom overlay Zoom Buttons */}
            <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: '20', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={handleZoomIn}
                style={{ width: '32px', height: '32px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--surface-color)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                title="Zoom In"
              >
                <ZoomIn size={15} />
              </button>
              <button 
                onClick={handleZoomOut}
                style={{ width: '32px', height: '32px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--surface-color)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                title="Zoom Out"
              >
                <ZoomOut size={15} />
              </button>
            </div>

            {/* Map Element */}
            <div 
              ref={mapRef} 
              style={{ width: '100%', height: '100%', background: 'var(--surface-elevated)' }}
            />

            {!isApiLoaded && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(248, 238, 231, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '10px' }}>
                <span className="spinner" style={{ border: '3px solid rgba(185,101,75,0.1)', borderTopColor: '#B9654B', borderRadius: '50%', width: '24px', height: '24px', animation: 'spin-loading 0.8s linear infinite' }}></span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Loading Google Maps JavaScript API...</span>
              </div>
            )}

            {/* Active Marker popover card overlay */}
            {activePin && (
              <div 
                className="map-info-popover animate-fade-in"
                style={{ 
                  position: 'absolute', 
                  bottom: '16px', 
                  left: '16px', 
                  right: '16px', 
                  maxWidth: '320px', 
                  zIndex: '25',
                  background: 'var(--surface-color)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '6px',
                  padding: '14px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed var(--glass-border)', paddingBottom: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>CASE #{activePin.id.toString().slice(-6)}</span>
                  <button onClick={() => setActivePin(null)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={14} />
                  </button>
                </div>
                <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>{activePin.title}</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Location: </span>
                    <span>{activePin.location}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Department: </span>
                    <span>{activePin.category}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Status: </span>
                    <span style={{ fontWeight: '600' }}>{activePin.status}</span>
                  </div>
                  {activePin.confidence && (
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>AI Confidence: </span>
                      <span>{activePin.confidence}</span>
                    </div>
                  )}
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Submitted: </span>
                    <span>{new Date(activePin.createdAt || activePin.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {/* Related complaints lists inside popup */}
                  {complaints.filter(o => o.id !== activePin.id && o.location?.toLowerCase().trim() === activePin.location?.toLowerCase().trim() && o.status !== 'Resolved').length > 0 && (
                    <div style={{ marginTop: '8px', borderTop: '1px dashed var(--glass-border)', paddingTop: '8px' }}>
                      <span style={{ display: 'block', fontSize: '10px', color: '#B9654B', fontWeight: '700' }}>🔥 HOTSPOT AREA OVERLAPS:</span>
                      <p style={{ fontSize: '10.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                        {complaints.filter(o => o.id !== activePin.id && o.location?.toLowerCase().trim() === activePin.location?.toLowerCase().trim() && o.status !== 'Resolved').length} other active reports near coordinates.
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                  <span className={`popover-urgency-badge urgency-${activePin.urgency?.toLowerCase()}`} style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', padding: '1px 6px', borderRadius: '3px' }}>
                    {activePin.urgency}
                  </span>
                  <button 
                    onClick={() => onSelectTicket && onSelectTicket(activePin.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'var(--accent-cyan)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '600',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>Open complaint</span>
                    <ExternalLink size={10} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Spatial Legend and guidelines */}
          <div className="map-legend-card" style={{ padding: '20px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '14px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>Command Map Legend</h4>
            <div className="legend-items" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="legend-dot" style={{ display: 'block', width: '10px', height: '10px', borderRadius: '50%', background: '#B9654B' }}></span>
                <div className="legend-text" style={{ fontSize: '12px' }}>
                  <span className="legend-name" style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>Critical Priority Pin</span>
                  <span className="legend-desc" style={{ color: 'var(--text-secondary)' }}>Immediate municipal crew dispatch required.</span>
                </div>
              </div>
              
              <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="legend-dot" style={{ display: 'block', width: '10px', height: '10px', borderRadius: '50%', background: '#d97706' }}></span>
                <div className="legend-text" style={{ fontSize: '12px' }}>
                  <span className="legend-name" style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>High Priority Pin</span>
                  <span className="legend-desc" style={{ color: 'var(--text-secondary)' }}>Engineering work order scheduled.</span>
                </div>
              </div>

              <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="legend-dot" style={{ display: 'block', width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></span>
                <div className="legend-text" style={{ fontSize: '12px' }}>
                  <span className="legend-name" style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>Medium Priority Pin</span>
                  <span className="legend-desc" style={{ color: 'var(--text-secondary)' }}>General maintenance or request.</span>
                </div>
              </div>

              <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="legend-dot" style={{ display: 'block', width: '10px', height: '10px', borderRadius: '50%', background: '#2e7d32' }}></span>
                <div className="legend-text" style={{ fontSize: '12px' }}>
                  <span className="legend-name" style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>Resolved / Completed Case</span>
                  <span className="legend-desc" style={{ color: 'var(--text-secondary)' }}>Verified completed Municipal action.</span>
                </div>
              </div>

              <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="legend-dot" style={{ display: 'block', width: '10px', height: '10px', borderRadius: '50%', background: '#06b6d4' }}></span>
                <div className="legend-text" style={{ fontSize: '12px' }}>
                  <span className="legend-name" style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>User Current Location</span>
                  <span className="legend-desc" style={{ color: 'var(--text-secondary)' }}>Center coordinate of local device with accuracy radius.</span>
                </div>
              </div>
            </div>

            <div className="map-instructions-box" style={{ marginTop: '20px', display: 'flex', gap: '8px', padding: '12px', background: 'var(--surface-elevated)', borderRadius: '6px', border: '1px solid var(--glass-border)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <Info size={16} className="text-cyan" style={{ flexShrink: 0 }} />
              <p style={{ margin: 0, lineHeight: '1.4' }}>Use the search box or "Locate Me" to zoom to places. Custom markers cluster dynamically at lower zoom levels; click a cluster to expand it.</p>
            </div>
          </div>
        </div>
      ) : (
        /* Table Queue List View */
        <div className="list-card-wrapper" style={{ padding: '20px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
          {filteredComplaints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
              <AlertTriangle size={36} className="text-muted" style={{ marginBottom: '12px' }} />
              <p>No complaints match selected priorities or category parameters.</p>
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
                  {filteredComplaints.map((ticket) => (
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
                          onClick={() => onSelectTicket && onSelectTicket(ticket.id)}
                          style={{ padding: '4px 8px', background: 'none', border: '1px solid var(--glass-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', color: 'var(--text-primary)' }}
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
