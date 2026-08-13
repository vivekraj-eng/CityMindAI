import React, { useState } from 'react';
import ComplaintForm from '../components/ComplaintForm';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function Citizen({ complaints, addComplaint, setView }) {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Tracking Tab States
  const [activeListTab, setActiveListTab] = useState('all'); // 'all' | 'track'
  const [trackIdInput, setTrackIdInput] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackAttempted, setTrackAttempted] = useState(false);

  const handleTrackSearch = () => {
    setTrackAttempted(true);
    if (!trackIdInput.trim()) {
      setTrackResult(null);
      return;
    }
    
    // Find ticket by exact ID or if the ticket ID contains/ends-with the searched input
    const found = complaints.find(c => 
      c.id.toString() === trackIdInput.trim() || 
      c.id.toString().slice(-6) === trackIdInput.trim()
    );
    
    setTrackResult(found || null);
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'All' || c.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

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
        return <span className="status-badge status-resolved"><CheckCircle2 size={12} /> Resolved</span>;
      case 'in progress':
        return <span className="status-badge status-progress"><Clock size={12} /> In Progress</span>;
      case 'submitted':
        return <span className="status-badge status-pending"><AlertCircle size={12} /> Submitted</span>;
      case 'ai analyzed':
        return <span className="status-badge status-pending"><Sparkles size={12} /> AI Analyzed</span>;
      case 'assigned':
        return <span className="status-badge status-pending"><CheckCircle2 size={12} /> Assigned</span>;
      default:
        return <span className="status-badge status-pending"><AlertCircle size={12} /> Pending Review</span>;
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
        return <span className="urgency-dot-badge text-red"><span className="dot dot-red animate-pulse-fast"></span> High</span>;
      case 'medium':
        return <span className="urgency-dot-badge text-yellow"><span className="dot dot-yellow"></span> Medium</span>;
      default:
        return <span className="urgency-dot-badge text-blue"><span className="dot dot-blue"></span> Low</span>;
    }
  };

  return (
    <div className="citizen-portal container">
      {/* Page Header */}
      <div className="portal-header">
        <button className="back-to-home" onClick={() => setView('home')}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <div className="title-area">
          <h2>Citizen Grievance Workspace</h2>
          <p>Submit issues directly. Our Gemini AI automatically routes, prioritizes, and categorizes complaints for municipal response.</p>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="portal-grid">
        {/* Left Column: Form */}
        <div className="portal-form-col">
          <ComplaintForm addComplaint={addComplaint} />
        </div>

        {/* Right Column: Tracker & List */}
        <div className="portal-list-col">
          <div className="list-card-wrapper">
            <div className="list-tabs-header">
              <button 
                className={`tab-link-btn ${activeListTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveListTab('all')}
              >
                My Submissions
              </button>
              <button 
                className={`tab-link-btn ${activeListTab === 'track' ? 'active' : ''}`}
                onClick={() => setActiveListTab('track')}
              >
                Track by Ticket ID
              </button>
            </div>

            {/* All Tickets Tab */}
            {activeListTab === 'all' && (
              <>
                {/* Filter controls */}
                <div className="filter-controls-row">
                  <div className="search-box">
                    <Search size={16} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search complaints..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="filter-box">
                    <Filter size={14} className="filter-icon" />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <option value="All">All Categories</option>
                      <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                      <option value="Water & Sanitation">Water & Sanitation</option>
                      <option value="Public Safety">Public Safety</option>
                      <option value="Waste Management">Waste Management</option>
                      <option value="Lighting & Electricity">Lighting & Electricity</option>
                    </select>
                  </div>
                </div>

                {/* Scrollable list */}
                <div className="complaint-scroll-container">
                  {filteredComplaints.length === 0 ? (
                    <div className="empty-list-state">
                      <AlertCircle size={28} className="text-muted" />
                      <p>No complaints found matching criteria.</p>
                    </div>
                  ) : (
                    filteredComplaints.map((c) => (
                      <div
                        key={c.id}
                        className={`citizen-complaint-card ${selectedComplaint?.id === c.id ? 'is-selected' : ''}`}
                        onClick={() => setSelectedComplaint(c)}
                      >
                        <div className="card-top-row">
                          <span className="card-cat">{c.category}</span>
                          {getUrgencyBadge(c.urgency)}
                        </div>
                        <h4 className="card-title-text">{c.title}</h4>
                        <div className="card-meta-row">
                          <div className="meta-item">
                            <MapPin size={12} />
                            <span>{c.location}</span>
                          </div>
                          <div className="meta-item">
                            <Calendar size={12} />
                            <span>{formatDate(c.createdAt)}</span>
                          </div>
                        </div>
                        <div className="card-bottom-row">
                          {getStatusBadge(c.status)}
                          <span className="view-details-action">
                            <span>Details</span>
                            <ChevronRight size={12} />
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* Track by ID Tab */}
            {activeListTab === 'track' && (
              <div className="track-by-id-tab">
                <div className="track-search-row">
                  <div className="search-box">
                    <Search size={16} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Enter 6-digit Ticket ID (e.g. 123456)"
                      value={trackIdInput}
                      onChange={(e) => setTrackIdInput(e.target.value)}
                    />
                  </div>
                  <button 
                    className="btn btn-primary track-btn"
                    onClick={handleTrackSearch}
                  >
                    Track
                  </button>
                </div>

                {trackAttempted && (
                  <div className="track-results-area">
                    {trackResult ? (
                      <div className="track-success-view">
                        <div className="track-ticket-summary" onClick={() => setSelectedComplaint(trackResult)}>
                          <div className="summary-header">
                            <span className="summary-cat">{trackResult.category}</span>
                            {getUrgencyBadge(trackResult.urgency)}
                          </div>
                          <h4 className="summary-title">{trackResult.title}</h4>
                          <div className="summary-meta-row">
                            <div className="meta-item">
                              <MapPin size={12} />
                              <span>{trackResult.location}</span>
                            </div>
                            <div className="meta-item">
                              <Calendar size={12} />
                              <span>{formatDate(trackResult.createdAt)}</span>
                            </div>
                          </div>
                          <div className="summary-footer-row">
                            {getStatusBadge(trackResult.status)}
                            <span className="drawer-trigger-hint">Inspect Triage Report →</span>
                          </div>
                        </div>

                        {/* Visual timeline stepper */}
                        <div className="status-tracker-section inline-tracker">
                          <span className="tracker-header">Resolution Stepper Timeline</span>
                          <div className="stepper-visual">
                            <div className={`step-item ${getStepClass(trackResult.status, 1)}`}>
                              <div className="step-circle"><CheckCircle2 size={14} /></div>
                              <div className="step-text-col">
                                <span className="step-name">Submitted</span>
                                <span className="step-time">{formatDate(trackResult.createdAt)}</span>
                              </div>
                            </div>
                            <div className={`step-item ${getStepClass(trackResult.status, 2)}`}>
                              <div className="step-circle"><Sparkles size={14} className="text-cyan" /></div>
                              <div className="step-text-col">
                                <span className="step-name">AI Analyzed</span>
                                <span className="step-time">Auto-Triage complete</span>
                              </div>
                            </div>
                            <div className={`step-item ${getStepClass(trackResult.status, 3)}`}>
                              <div className="step-circle"><CheckCircle2 size={14} /></div>
                              <div className="step-text-col">
                                <span className="step-name">Assigned</span>
                                <span className="step-time">Routed to {trackResult.category} Dept</span>
                              </div>
                            </div>
                            <div className={`step-item ${getStepClass(trackResult.status, 4)}`}>
                              <div className="step-circle">
                                {trackResult.status?.toLowerCase() === 'in progress' ? <Clock size={14} className="spin-slow" /> : <CheckCircle2 size={14} />}
                              </div>
                              <div className="step-text-col">
                                <span className="step-name">In Progress</span>
                                <span className="step-time">{['pending', 'submitted', 'ai analyzed', 'assigned'].includes(trackResult.status?.toLowerCase()) ? 'Awaiting municipal crew' : 'Response team on-site'}</span>
                              </div>
                            </div>
                            <div className={`step-item ${getStepClass(trackResult.status, 5)}`}>
                              <div className="step-circle"><CheckCircle2 size={14} /></div>
                              <div className="step-text-col">
                                <span className="step-name">Resolved</span>
                                <span className="step-time">{trackResult.status?.toLowerCase() === 'resolved' ? 'Resolution verified by City Operations' : 'Awaiting completion'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="track-empty-state">
                        <AlertCircle size={28} className="text-red" />
                        <h4>Ticket Not Found</h4>
                        <p>We couldn't find a grievance ticket matching ID: <strong>{trackIdInput}</strong>. Please check the ID and try again.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Side Drawer / Modal */}
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
              {/* Heading */}
              <span className="drawer-cat">{selectedComplaint.category}</span>
              <h3 className="drawer-title">{selectedComplaint.title}</h3>
              
              <div className="drawer-meta-pills">
                {getUrgencyBadge(selectedComplaint.urgency)}
                {getStatusBadge(selectedComplaint.status)}
              </div>

              {/* Stepper Status Tracker */}
              <div className="status-tracker-section">
                <span className="tracker-header">Resolution Stepper</span>
                <div className="stepper-visual">
                  {/* Step 1: Submit */}
                  <div className={`step-item ${getStepClass(selectedComplaint.status, 1)}`}>
                    <div className="step-circle"><CheckCircle2 size={14} /></div>
                    <div className="step-text-col">
                      <span className="step-name">Issue Registered</span>
                      <span className="step-time">{formatDate(selectedComplaint.createdAt)}</span>
                    </div>
                  </div>
                  {/* Step 2: Triage */}
                  <div className={`step-item ${getStepClass(selectedComplaint.status, 2)}`}>
                    <div className="step-circle"><Sparkles size={14} className="text-cyan" /></div>
                    <div className="step-text-col">
                      <span className="step-name">AI Triage Completed</span>
                      <span className="step-time">Analyzed by Gemini AI</span>
                    </div>
                  </div>
                  {/* Step 3: Routing */}
                  <div className={`step-item ${getStepClass(selectedComplaint.status, 3)}`}>
                    <div className="step-circle"><CheckCircle2 size={14} /></div>
                    <div className="step-text-col">
                      <span className="step-name">Routed to Department</span>
                      <span className="step-time">Assigned: {selectedComplaint.category}</span>
                    </div>
                  </div>
                  {/* Step 4: Dispatch */}
                  <div className={`step-item ${getStepClass(selectedComplaint.status, 4)}`}>
                    <div className="step-circle">
                      {selectedComplaint.status?.toLowerCase() === 'in progress' ? <Clock size={14} className="spin-slow" /> : <CheckCircle2 size={14} />}
                    </div>
                    <div className="step-text-col">
                      <span className="step-name">Municipal Work Dispatch</span>
                      <span className="step-time">{['pending', 'submitted', 'ai analyzed', 'assigned'].includes(selectedComplaint.status?.toLowerCase()) ? 'Awaiting Dispatch' : 'Crew Dispatched'}</span>
                    </div>
                  </div>
                  {/* Step 5: Resolved */}
                  <div className={`step-item ${getStepClass(selectedComplaint.status, 5)}`}>
                    <div className="step-circle"><CheckCircle2 size={14} /></div>
                    <div className="step-text-col">
                      <span className="step-name">Resolved</span>
                      <span className="step-time">{selectedComplaint.status?.toLowerCase() === 'resolved' ? 'Completed & Verified' : 'Awaiting Completion'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complaint description */}
              <div className="drawer-desc-box">
                <span className="detail-section-title">Citizen Submission Description</span>
                <p className="desc-text">{selectedComplaint.description}</p>
                <div className="location-detail-row">
                  <MapPin size={14} className="text-cyan" />
                  <span>{selectedComplaint.location}</span>
                </div>
                {selectedComplaint.image && (
                  <div className="drawer-image-box" style={{ marginTop: '16px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                    <img src={selectedComplaint.image} alt="Grievance Incident" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block' }} />
                  </div>
                )}
              </div>

              {/* Gemini AI Extract details */}
              <div className="drawer-ai-details">
                <div className="ai-detail-header">
                  <Sparkles size={14} className="text-cyan" />
                  <span>Gemini AI Extracted Insights</span>
                </div>
                <div className="ai-detail-body">
                  {selectedComplaint.detectedIssue && (
                    <div className="ai-detail-block">
                      <span className="ai-label">Detected Incident</span>
                      <p className="ai-val" style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                        {selectedComplaint.detectedIssue} (Confidence: {selectedComplaint.confidence || '94%'})
                      </p>
                    </div>
                  )}
                  <div className="ai-detail-block">
                    <span className="ai-label">Summary Overview</span>
                    <p className="ai-val">{selectedComplaint.aiSummary || 'Triage summary generated instantly.'}</p>
                  </div>
                  {selectedComplaint.recommendedAction && (
                    <div className="ai-detail-block">
                      <span className="ai-label">Suggested Resolution Directive</span>
                      <p className="ai-val text-cyan" style={{ fontWeight: '500' }}>{selectedComplaint.recommendedAction}</p>
                    </div>
                  )}
                  <div className="ai-detail-block">
                    <span className="ai-label">Triage Tags</span>
                    <div className="tags-row">
                      {selectedComplaint.tags && selectedComplaint.tags.map((tag, idx) => (
                        <span key={idx} className="ai-pill-tag">#{tag}</span>
                      ))}
                      <span className="ai-pill-tag sentiment-pill">{selectedComplaint.sentiment || 'Neutral'} Sentiment</span>
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
