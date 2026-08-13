import React, { useState } from 'react';
import ComplaintForm from '../components/ComplaintForm';
import { 
  Search, 
  MapPin, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  X, 
  Sparkles,
  ArrowLeft,
  User,
  ClipboardList,
  LocateFixed,
  Bell,
  LogOut,
  Edit2,
  Lock,
  Eye,
  Plus
} from 'lucide-react';

export default function Citizen({ 
  complaints, 
  addComplaint, 
  setView, 
  activeTab = 'my-reports', 
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

  const navigateToTab = (tabName) => {
    if (setActiveTab) {
      setActiveTab(tabName);
    }
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

  // Build dynamic Citizen Notifications
  const getCitizenNotifications = () => {
    const list = [];
    citizenComplaints.forEach((c) => {
      // 1. Submit update
      list.push({
        id: `submit-${c.id}`,
        title: 'Grievance Filed Successfully',
        message: `Your report "${c.title}" has been registered in the city grid database.`,
        time: c.createdAt || c.created_at,
        icon: ClipboardList,
        color: '#526A78'
      });
      // 2. AI Analyzed update
      if (['ai analyzed', 'assigned', 'in progress', 'resolved'].includes(c.status?.toLowerCase())) {
        list.push({
          id: `ai-${c.id}`,
          title: 'AI Auto-Triage Completed',
          message: `Gemini AI has categorized your report under "${c.category}" with ${c.urgency} priority.`,
          time: c.createdAt,
          icon: Sparkles,
          color: 'var(--accent-cyan)'
        });
      }
      // 3. Assigned update
      if (['assigned', 'in progress', 'resolved'].includes(c.status?.toLowerCase())) {
        list.push({
          id: `assign-${c.id}`,
          title: 'Task Dispatched to Engineering Team',
          message: `Work scheduled for dispatch to municipal crew.`,
          time: c.updatedAt || c.createdAt,
          icon: Clock,
          color: '#3b82f6'
        });
      }
      // 4. Resolved update
      if (c.status?.toLowerCase() === 'resolved') {
        list.push({
          id: `resolve-${c.id}`,
          title: 'Grievance Marked Resolved',
          message: `Municipal action verified: "${c.resolutionNote || 'Work completed.'}"`,
          time: c.resolutionDate || c.updatedAt || c.createdAt,
          icon: CheckCircle2,
          color: '#2e7d32'
        });
      }
    });
    return list.slice(0, 8); // return top 8 logs
  };

  const notifications = getCitizenNotifications();

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
        return <span style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(46,125,50,0.08)', color: '#2e7d32', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(46,125,50,0.2)' }}><CheckCircle2 size={10} /> Resolved</span>;
      case 'in progress':
        return <span style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(217,119,6,0.08)', color: '#d97706', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(217,119,6,0.2)' }}><Clock size={10} /> In Progress</span>;
      case 'submitted':
        return <span style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(82,106,120,0.08)', color: '#526A78', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(82,106,120,0.2)' }}><AlertCircle size={10} /> Submitted</span>;
      case 'ai analyzed':
        return <span style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(185,101,75,0.08)', color: '#B9654B', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(185,101,75,0.2)' }}><Sparkles size={10} /> AI Analyzed</span>;
      case 'assigned':
        return <span style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(6,182,212,0.08)', color: '#06b6d4', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(6,182,212,0.2)' }}><CheckCircle2 size={10} /> Assigned</span>;
      default:
        return <span style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(82,106,120,0.08)', color: '#526A78', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(82,106,120,0.2)' }}><AlertCircle size={10} /> Submitted</span>;
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
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#B9654B', fontWeight: '700' }}><span className="dot dot-red animate-pulse-fast" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#B9654B' }}></span> High</span>;
      case 'medium':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#d97706', fontWeight: '600' }}><span className="dot dot-yellow" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#d97706' }}></span> Medium</span>;
      default:
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#3b82f6', fontWeight: '400' }}><span className="dot dot-blue" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }}></span> Low</span>;
    }
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('citymind_user');
    setView('home');
  };

  const sidebarItems = [
    { id: 'my-reports', name: 'My Reports', icon: ClipboardList },
    { id: 'track', name: 'Track Status', icon: LocateFixed },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'profile', name: 'Profile', icon: User }
  ];

  return (
    <div className="authority-command-layout" style={{ display: 'flex', minHeight: 'calc(100vh - 120px)', gap: '24px', marginTop: '24px', position: 'relative' }}>
      
      {/* Citizen LEFT SIDEBAR */}
      <aside 
        className="command-sidebar"
        style={{
          width: '260px',
          background: 'var(--surface-color)',
          border: '1px solid var(--glass-border)',
          borderRadius: '8px',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Header & Back to home */}
          <div>
            <button className="back-to-home w-full" onClick={() => setView('home')} style={{ marginBottom: '16px', justifyContent: 'center' }}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px' }}>
              <div style={{ padding: '6px', background: 'rgba(185, 101, 75, 0.08)', borderRadius: '6px', color: 'var(--accent-cyan)' }}>
                <User size={18} />
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>Citizen Portal</span>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Terminal v2.5</span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {sidebarItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: isActive ? 'rgba(185, 101, 75, 0.06)' : 'transparent',
                    border: isActive ? '1px solid rgba(185, 101, 75, 0.12)' : '1px solid transparent',
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: isActive ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                >
                  <IconComp size={16} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Menu Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              background: 'transparent',
              border: 'none',
              color: '#B9654B',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              fontWeight: '500'
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace content panel */}
      <main style={{ flex: '1', minWidth: '0', background: 'transparent' }}>
        
        {/* Report Issue sub-page */}
        {activeTab === 'report' && (
          <div style={{ background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '24px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} className="text-cyan" />
                <span>Submit a New Grievance</span>
              </h3>
              <button 
                onClick={() => navigateToTab('my-reports')}
                style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
            <ComplaintForm addComplaint={addComplaint} />
          </div>
        )}

        {/* My Reports page */}
        {activeTab === 'my-reports' && (
          <div className="list-card-wrapper" style={{ padding: '20px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
              <div className="title-block">
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 2px 0', fontFamily: 'var(--font-heading)' }}>My Grievance Reports</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Trace all submitted grievance logs, priority states, and department workloads.</p>
              </div>
              <button 
                onClick={() => navigateToTab('report')} 
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', padding: '8px 16px' }}
              >
                <Plus size={14} />
                <span>Report New Issue</span>
              </button>
            </div>

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
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
                      <th style={{ padding: '8px 4px', color: 'var(--text-muted)', fontWeight: '600' }}>Case ID</th>
                      <th style={{ padding: '8px 4px', color: 'var(--text-muted)', fontWeight: '600' }}>Issue Title</th>
                      <th style={{ padding: '8px 4px', color: 'var(--text-muted)', fontWeight: '600' }}>Location</th>
                      <th style={{ padding: '8px 4px', color: 'var(--text-muted)', fontWeight: '600' }}>Reported Date</th>
                      <th style={{ padding: '8px 4px', color: 'var(--text-muted)', fontWeight: '600' }}>Priority</th>
                      <th style={{ padding: '8px 4px', color: 'var(--text-muted)', fontWeight: '600' }}>Department</th>
                      <th style={{ padding: '8px 4px', color: 'var(--text-muted)', fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '8px 4px', color: 'var(--text-muted)', fontWeight: '600', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citizenComplaints.filter(c => {
                      const term = searchTerm.toLowerCase().trim();
                      return c.title.toLowerCase().includes(term) ||
                             c.description.toLowerCase().includes(term) ||
                             c.location.toLowerCase().includes(term);
                    }).map((c) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid rgba(231,214,201,0.3)', cursor: 'pointer' }} onClick={() => setSelectedComplaint(c)}>
                        <td style={{ padding: '10px 4px', color: 'var(--text-muted)' }}>#{c.id.toString().slice(-6)}</td>
                        <td style={{ padding: '10px 4px', fontWeight: '600', color: 'var(--text-primary)' }}>{c.title}</td>
                        <td style={{ padding: '10px 4px', color: 'var(--text-secondary)' }}>{c.location}</td>
                        <td style={{ padding: '10px 4px', color: 'var(--text-secondary)' }}>{formatDate(c.createdAt)}</td>
                        <td style={{ padding: '10px 4px' }}>{getUrgencyBadge(c.urgency)}</td>
                        <td style={{ padding: '10px 4px', color: 'var(--text-secondary)' }}>{c.category?.split(' & ')[0]}</td>
                        <td style={{ padding: '10px 4px' }}>{getStatusBadge(c.status)}</td>
                        <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedComplaint(c); }}
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

        {/* Track Status page */}
        {activeTab === 'track' && (
          <div style={{ background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '24px', maxWidth: '580px', margin: '0 auto', width: '100%' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>Track Complaint Status</h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Enter the case Ticket ID (or the last 6 characters) below to check the real-time status timeline and updates.</p>
            
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
                      <div className="step-circle"><CheckCircle2 size={12} /></div>
                      <div className="step-text-col">
                        <span className="step-name" style={{ fontSize: '12px', fontWeight: '700' }}>Submitted</span>
                        <span className="step-time" style={{ fontSize: '10.5px' }}>{formatDate(trackResult.createdAt)}</span>
                      </div>
                    </div>
                    <div className={`step-item ${getStepClass(trackResult.status, 2)}`}>
                      <div className="step-circle"><Sparkles size={12} className="text-cyan" /></div>
                      <div className="step-text-col">
                        <span className="step-name" style={{ fontSize: '12px', fontWeight: '700' }}>AI Analyzed</span>
                        <span className="step-time" style={{ fontSize: '10.5px' }}>Auto-Triage complete</span>
                      </div>
                    </div>
                    <div className={`step-item ${getStepClass(trackResult.status, 3)}`}>
                      <div className="step-circle"><CheckCircle2 size={12} /></div>
                      <div className="step-text-col">
                        <span className="step-name">Assigned</span>
                        <span className="step-time" style={{ fontSize: '10.5px' }}>Routed to {trackResult.category}</span>
                      </div>
                    </div>
                    <div className={`step-item ${getStepClass(trackResult.status, 4)}`}>
                      <div className="step-circle">
                        {trackResult.status?.toLowerCase() === 'in progress' ? <Clock size={12} className="spin-slow" /> : <CheckCircle2 size={12} />}
                      </div>
                      <div className="step-text-col">
                        <span className="step-name" style={{ fontSize: '12px', fontWeight: '700' }}>In Progress</span>
                        <span className="step-time" style={{ fontSize: '10.5px' }}>Response team on-site</span>
                      </div>
                    </div>
                    <div className={`step-item ${getStepClass(trackResult.status, 5)}`}>
                      <div className="step-circle"><CheckCircle2 size={12} /></div>
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

        {/* Notifications page */}
        {activeTab === 'notifications' && (
          <div className="list-card-wrapper" style={{ padding: '20px', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>Grievance Timeline Updates</h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Dynamic alerts regarding triage, dispatch assignments, and resolution notes for your active reports.</p>

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
        )}

        {/* Profile page */}
        {activeTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
            
            {/* Avatar & Info */}
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
                  Edit Profile
                </button>
              )}
            </div>

            {/* Preferences Section */}
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

              {/* Preferences sliders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                <button onClick={() => alert("Notification preference configured.")} style={{ display: 'flex', justifyBlock: 'space-between', alignItems: 'center', width: '100%', padding: '10px 12px', background: 'var(--surface-elevated)', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', justifyContent: 'space-between' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Bell size={13} className="text-cyan" /> Notification Preferences</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Configure</span>
                </button>

                <button onClick={() => alert("Privacy preferences saved.")} style={{ display: 'flex', justifyBlock: 'space-between', alignItems: 'center', width: '100%', padding: '10px 12px', background: 'var(--surface-elevated)', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', justifyContent: 'space-between' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Lock size={13} className="text-cyan" /> Privacy & Telemetry</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Review</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

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
