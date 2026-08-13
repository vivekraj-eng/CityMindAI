import React, { useState } from 'react';
import ComplaintForm from '../components/ComplaintForm';
import { 
  Search, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  X, 
  Sparkles,
  ArrowLeft,
  User,
  PlusCircle,
  List,
  Compass,
  Lock,
  Eye,
  LogOut,
  Bell,
  CheckCircle
} from 'lucide-react';

export default function Citizen({ 
  complaints, 
  addComplaint, 
  setView, 
  activeTab = 'report', 
  setActiveTab,
  user,
  setUser
}) {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [trackIdInput, setTrackIdInput] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackAttempted, setTrackAttempted] = useState(false);

  // Profile Form Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || 'Citizen User');

  const handleTrackSearch = () => {
    setTrackAttempted(true);
    if (!trackIdInput.trim()) {
      setTrackResult(null);
      return;
    }
    const found = complaints.find(c => 
      c.id.toString() === trackIdInput.trim() || 
      c.id.toString().slice(-6) === trackIdInput.trim()
    );
    setTrackResult(found || null);
  };

  // Filter complaints representing the citizen's own submissions
  const getCitizenComplaints = () => {
    if (!user) return complaints;
    if (user.email === 'guest@citymind.ai') return complaints.slice(0, 3); // Mock guest data
    return complaints.filter(c => 
      c.email?.toLowerCase().trim() === user.email?.toLowerCase().trim() ||
      c.citizenName?.toLowerCase().trim() === user.name?.toLowerCase().trim()
    );
  };

  const citizenComplaints = getCitizenComplaints();
  const activeReportsCount = citizenComplaints.filter(c => c.status !== 'Resolved').length;
  const resolvedReportsCount = citizenComplaints.filter(c => c.status === 'Resolved').length;

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return <span className="status-badge status-resolved" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(46,125,50,0.08)', color: '#2e7d32', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(46,125,50,0.2)' }}><CheckCircle size={10} /> Resolved</span>;
      case 'in progress':
        return <span className="status-badge status-progress" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(217,119,6,0.08)', color: '#d97706', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(217,119,6,0.2)' }}><Clock size={10} /> In Progress</span>;
      case 'submitted':
        return <span className="status-badge status-pending" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(82,106,120,0.08)', color: '#526A78', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(82,106,120,0.2)' }}><AlertCircle size={10} /> Submitted</span>;
      case 'ai analyzed':
        return <span className="status-badge status-pending" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(185,101,75,0.08)', color: '#B9654B', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(185,101,75,0.2)' }}><Sparkles size={10} /> AI Analyzed</span>;
      case 'assigned':
        return <span className="status-badge status-pending" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(6,182,212,0.08)', color: '#06b6d4', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(6,182,212,0.2)' }}><CheckCircle2 size={10} /> Assigned</span>;
      default:
        return <span className="status-badge status-pending" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(82,106,120,0.08)', color: '#526A78', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(82,106,120,0.2)' }}><AlertCircle size={10} /> Submitted</span>;
    }
  };

  const getStepClass = (currentStatus, stepNumber) => {
    const statusMap = {
      'submitted': 1,
      'ai analyzed': 2,
      'assigned': 3,
      'pending': 3,
      'in progress': 4,
      'resolved': 5
    };
    const currentStep = statusMap[currentStatus?.toLowerCase()] || 3;
    return stepNumber <= currentStep ? 'step-completed' : 'step-pending';
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
      case 'critical':
        return <span className="urgency-dot-badge text-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#B9654B', fontWeight: '700' }}><span className="dot dot-red animate-pulse-fast" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#B9654B' }}></span> High</span>;
      case 'medium':
        return <span className="urgency-dot-badge text-yellow" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#d97706', fontWeight: '600' }}><span className="dot dot-yellow" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#d97706' }}></span> Medium</span>;
      default:
        return <span className="urgency-dot-badge text-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#3b82f6', fontWeight: '400' }}><span className="dot dot-blue" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }}></span> Low</span>;
    }
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('citymind_user');
    setView('home');
  };

  return (
    <div className="citizen-portal container" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>
      
      {/* Portal Header */}
      <div className="portal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <button className="back-to-home" onClick={() => setView('home')} style={{ marginBottom: '12px' }}>
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
          <div className="title-area">
            <h2 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Citizen Workspace</h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>File a municipal issue, track resolution timelines, or manage your citizen profile portal.</p>
          </div>
        </div>

        {/* Sub Navigation menu pills */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--surface-color)', padding: '4px', borderRadius: '8px', border: '1px solid var(--glass-border)', marginTop: '8px' }}>
          <button 
            onClick={() => setActiveTab('report')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '6px', border: 'none', background: activeTab === 'report' ? 'rgba(185,101,75,0.08)' : 'transparent', color: activeTab === 'report' ? 'var(--accent-cyan)' : 'var(--text-secondary)', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <PlusCircle size={14} />
            <span>Report Issue</span>
          </button>
          <button 
            onClick={() => setActiveTab('my-reports')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '6px', border: 'none', background: activeTab === 'my-reports' ? 'rgba(185,101,75,0.08)' : 'transparent', color: activeTab === 'my-reports' ? 'var(--accent-cyan)' : 'var(--text-secondary)', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <List size={14} />
            <span>My Reports</span>
          </button>
          <button 
            onClick={() => setActiveTab('track')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '6px', border: 'none', background: activeTab === 'track' ? 'rgba(185,101,75,0.08)' : 'transparent', color: activeTab === 'track' ? 'var(--accent-cyan)' : 'var(--text-secondary)', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <Compass size={14} />
            <span>Track Complaint</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '6px', border: 'none', background: activeTab === 'profile' ? 'rgba(185,101,75,0.08)' : 'transparent', color: activeTab === 'profile' ? 'var(--accent-cyan)' : 'var(--text-secondary)', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <User size={14} />
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* Active Tab contents */}
      
      {/* 1. Report Issue tab */}
      {activeTab === 'report' && (
        <div style={{ background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '24px', boxShadow: '0 4px 20px rgba(185,101,75,0.02)', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={18} className="text-cyan" />
            <span>Submit a New Grievance</span>
          </h3>
          <ComplaintForm addComplaint={addComplaint} />
        </div>
      )}

      {/* 2. My Reports tab */}
      {activeTab === 'my-reports' && (
        <div className="list-card-wrapper" style={{ padding: '20px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <List size={16} className="text-cyan" />
            <span>My Submitted Grievances ({citizenComplaints.length})</span>
          </h3>

          <div style={{ marginBottom: '16px', maxWidth: '360px', position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Filter by title, description or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--surface-elevated)', color: 'var(--text-primary)', fontSize: '12.5px' }}
            />
          </div>

          {citizenComplaints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
              <AlertCircle size={36} className="text-muted" style={{ marginBottom: '12px' }} />
              <p>You have not submitted any grievance logs yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {citizenComplaints.filter(c => {
                const term = searchTerm.toLowerCase().trim();
                return c.title.toLowerCase().includes(term) ||
                       c.description.toLowerCase().includes(term) ||
                       c.location.toLowerCase().includes(term);
              }).map((c) => (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedComplaint(c)}
                  style={{ padding: '16px', background: 'var(--surface-elevated)', border: '1px solid var(--glass-border)', borderRadius: '6px', cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', justifyBlock: 'space-between' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>#{c.id.toString().slice(-6)}</span>
                      {getUrgencyBadge(c.urgency)}
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>{c.title}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 12px 0', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.4' }}>{c.description}</p>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '10px', marginTop: 'auto', fontSize: '11px' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}><MapPin size={10} /> {c.location}</span>
                    {getStatusBadge(c.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Track Complaint tab */}
      {activeTab === 'track' && (
        <div style={{ background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '24px', maxWidth: '580px', margin: '0 auto', width: '100%' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={18} className="text-cyan" />
            <span>Operational Ticket Tracking</span>
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Enter the case Ticket ID (or the last 6 characters) below to check the real-time status timeline and updates.</p>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input 
              type="text" 
              placeholder="e.g. 5f5f28 or complete ticket UUID..."
              value={trackIdInput}
              onChange={(e) => setTrackIdInput(e.target.value)}
              style={{ flex: 1, padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--surface-elevated)', color: 'var(--text-primary)', fontSize: '13px' }}
            />
            <button onClick={handleTrackSearch} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '13px' }}>
              Track
            </button>
          </div>

          {trackAttempted && !trackResult && (
            <div style={{ padding: '12px', background: 'rgba(185,101,75,0.06)', borderRadius: '4px', border: '1px solid rgba(185,101,75,0.15)', color: '#B9654B', fontSize: '12.5px', textAlign: 'center' }}>
              No ticket matched the ID. Check credentials and try again.
            </div>
          )}

          {trackResult && (
            <div style={{ border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '16px', background: 'var(--surface-elevated)', marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px dashed var(--glass-border)', paddingBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>CASE #{trackResult.id.toString().slice(-6)}</span>
                  <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px', marginBottom: 0 }}>{trackResult.title}</h4>
                </div>
                {getStatusBadge(trackResult.status)}
              </div>

              {/* Status stepper timeline */}
              <div className="status-tracker-section inline-tracker" style={{ background: 'none', border: 'none', padding: 0, marginTop: '16px' }}>
                <div className="stepper-visual">
                  <div className={`step-item ${getStepClass(trackResult.status, 1)}`}>
                    <div className="step-circle"><CheckCircle2 size={14} /></div>
                    <div className="step-text-col">
                      <span className="step-name" style={{ fontSize: '12px', fontWeight: '700' }}>Submitted</span>
                      <span className="step-time" style={{ fontSize: '10.5px' }}>{formatDate(trackResult.createdAt)}</span>
                    </div>
                  </div>
                  <div className={`step-item ${getStepClass(trackResult.status, 2)}`}>
                    <div className="step-circle"><Sparkles size={14} className="text-cyan" /></div>
                    <div className="step-text-col">
                      <span className="step-name" style={{ fontSize: '12px', fontWeight: '700' }}>AI Analyzed</span>
                      <span className="step-time" style={{ fontSize: '10.5px' }}>Auto-Triage complete</span>
                    </div>
                  </div>
                  <div className={`step-item ${getStepClass(trackResult.status, 3)}`}>
                    <div className="step-circle"><CheckCircle2 size={14} /></div>
                    <div className="step-text-col">
                      <span className="step-name" style={{ fontSize: '12px', fontWeight: '700' }}>Assigned</span>
                      <span className="step-time" style={{ fontSize: '10.5px' }}>Routed to {trackResult.category}</span>
                    </div>
                  </div>
                  <div className={`step-item ${getStepClass(trackResult.status, 4)}`}>
                    <div className="step-circle">
                      {trackResult.status?.toLowerCase() === 'in progress' ? <Clock size={14} className="spin-slow" /> : <CheckCircle2 size={14} />}
                    </div>
                    <div className="step-text-col">
                      <span className="step-name" style={{ fontSize: '12px', fontWeight: '700' }}>In Progress</span>
                      <span className="step-time" style={{ fontSize: '10.5px' }}>Response team on-site</span>
                    </div>
                  </div>
                  <div className={`step-item ${getStepClass(trackResult.status, 5)}`}>
                    <div className="step-circle"><CheckCircle2 size={14} /></div>
                    <div className="step-text-col">
                      <span className="step-name" style={{ fontSize: '12px', fontWeight: '700' }}>Resolved</span>
                      <span className="step-time" style={{ fontSize: '10.5px' }}>Verification completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Profile tab */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          
          {/* Avatar and Info */}
          <div className="list-card-wrapper" style={{ padding: '24px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--surface-elevated)', border: '2px solid rgba(185,101,75,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                <User size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{profileName}</h3>
                <span style={{ fontSize: '11px', background: 'rgba(82,106,120,0.08)', color: '#526A78', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {user?.role || 'Citizen'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: '600', marginBottom: '2px' }}>Email Address</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{user?.email || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: '600', marginBottom: '2px' }}>Account Authority Level</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Standard Citizen Access</span>
              </div>
            </div>

            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px dashed var(--glass-border)', paddingTop: '14px' }}>
                <input 
                  type="text" 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--surface-elevated)', color: 'var(--text-primary)', fontSize: '13px' }}
                />
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => { setUser({ ...user, name: profileName }); setIsEditing(false); }} className="btn btn-primary" style={{ fontSize: '11px', padding: '6px 12px' }}>Save</button>
                  <button onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px 12px' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} className="btn btn-secondary" style={{ fontSize: '12px', padding: '8px 12px', alignSelf: 'flex-start' }}>
                Edit Profile name
              </button>
            )}
          </div>

          {/* Grievance Telemetry Metrics Summary */}
          <div className="list-card-wrapper" style={{ padding: '24px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>My Grievance Overview</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
              <div style={{ padding: '10px', background: 'var(--surface-elevated)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>{citizenComplaints.length}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>My Reports</span>
              </div>
              <div style={{ padding: '10px', background: 'var(--surface-elevated)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#d97706', display: 'block' }}>{activeReportsCount}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active</span>
              </div>
              <div style={{ padding: '10px', background: 'var(--surface-elevated)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#2e7d32', display: 'block' }}>{resolvedReportsCount}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Resolved</span>
              </div>
            </div>

            {/* Simulated actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              <button onClick={() => alert("Notification Preference Saved: Push Notifications enabled.")} style={{ display: 'flex', justifyBlock: 'space-between', alignItems: 'center', width: '100%', padding: '10px 12px', background: 'var(--surface-elevated)', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', justifyContent: 'space-between' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Bell size={13} className="text-cyan" /> Notification Settings</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Configure</span>
              </button>

              <button onClick={() => alert("Privacy preference updated.")} style={{ display: 'flex', justifyBlock: 'space-between', alignItems: 'center', width: '100%', padding: '10px 12px', background: 'var(--surface-elevated)', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', justifyContent: 'space-between' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Lock size={13} className="text-cyan" /> Privacy & Telemetry</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Review</span>
              </button>

              <button 
                onClick={handleSignOut} 
                style={{ display: 'flex', justifyBlock: 'space-between', alignItems: 'center', width: '100%', padding: '10px 12px', background: 'rgba(185,101,75,0.04)', border: '1px solid rgba(185,101,75,0.15)', borderRadius: '6px', fontSize: '12px', color: '#B9654B', cursor: 'pointer', textAlign: 'left', justifyContent: 'space-between', fontWeight: '600' }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><LogOut size={13} /> Sign Out</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Details Side Drawer */}
      {selectedComplaint && (
        <div className="details-drawer-backdrop" onClick={() => setSelectedComplaint(null)}>
          <div className="details-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <span className="drawer-ticket-id">TICKET ID: #{selectedComplaint.id.toString().slice(-6)}</span>
              <button className="close-drawer-btn" onClick={() => setSelectedComplaint(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="drawer-content">
              <span className="drawer-cat">{selectedComplaint.category}</span>
              <h3 className="drawer-title">{selectedComplaint.title}</h3>
              
              <div className="drawer-meta-pills" style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                {getUrgencyBadge(selectedComplaint.urgency)}
                {getStatusBadge(selectedComplaint.status)}
              </div>

              {/* Description */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Description</span>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>{selectedComplaint.description}</p>
              </div>

              {selectedComplaint.image && (
                <div style={{ marginBottom: '20px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                  <img src={selectedComplaint.image} alt="Reported details" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover' }} />
                </div>
              )}

              {/* Status stepper */}
              <div className="status-tracker-section inline-tracker" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginTop: '16px' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: '700', display: 'block', marginBottom: '10px' }}>Resolution Stepper Timeline</span>
                <div className="stepper-visual">
                  <div className={`step-item ${getStepClass(selectedComplaint.status, 1)}`}>
                    <div className="step-circle"><CheckCircle2 size={12} /></div>
                    <div className="step-text-col">
                      <span className="step-name">Submitted</span>
                      <span className="step-time">{formatDate(selectedComplaint.createdAt)}</span>
                    </div>
                  </div>
                  <div className={`step-item ${getStepClass(selectedComplaint.status, 2)}`}>
                    <div className="step-circle"><Sparkles size={12} className="text-cyan" /></div>
                    <div className="step-text-col">
                      <span className="step-name">AI Analyzed</span>
                      <span className="step-time">Triage Complete</span>
                    </div>
                  </div>
                  <div className={`step-item ${getStepClass(selectedComplaint.status, 3)}`}>
                    <div className="step-circle"><CheckCircle2 size={12} /></div>
                    <div className="step-text-col">
                      <span className="step-name">Assigned</span>
                      <span className="step-time">Routed to Dept</span>
                    </div>
                  </div>
                  <div className={`step-item ${getStepClass(selectedComplaint.status, 4)}`}>
                    <div className="step-circle">
                      {selectedComplaint.status?.toLowerCase() === 'in progress' ? <Clock size={12} className="spin-slow" /> : <CheckCircle2 size={12} />}
                    </div>
                    <div className="step-text-col">
                      <span className="step-name">In Progress</span>
                      <span className="step-time">Crews Dispatch</span>
                    </div>
                  </div>
                  <div className={`step-item ${getStepClass(selectedComplaint.status, 5)}`}>
                    <div className="step-circle"><CheckCircle2 size={12} /></div>
                    <div className="step-text-col">
                      <span className="step-name">Resolved</span>
                      <span className="step-time">Verified Action</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
