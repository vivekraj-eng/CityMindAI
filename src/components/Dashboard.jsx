import React, { useState, useEffect } from 'react';
import ComplaintCard from './ComplaintCard';
import { suggestSolution } from '../services/gemini';
import { 
  Search, 
  Filter, 
  MapPin, 
  User, 
  Sparkles, 
  Clock, 
  Settings, 
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

export default function Dashboard({ complaints, updateComplaintStatus, updateComplaintCategory, preselectedId = null }) {
  const [selectedId, setSelectedId] = useState(preselectedId || complaints[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [resolutionInput, setResolutionInput] = useState('');
  const [showProofForm, setShowProofForm] = useState(false);

  useEffect(() => {
    if (preselectedId) {
      setSelectedId(preselectedId);
    }
  }, [preselectedId]);

  // AI advisory state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSolution, setAiSolution] = useState('');

  const selectedTicket = complaints.find(c => c.id === selectedId);

  // Compute related complaints
  const relatedTickets = selectedTicket ? complaints.filter((other) => {
    if (other.id === selectedTicket.id) return false;
    
    // Check coordinate distance if lat/lng are present
    let isNearby = false;
    if (selectedTicket.latitude && selectedTicket.longitude && other.latitude && other.longitude) {
      const latDiff = Math.abs(parseFloat(selectedTicket.latitude) - parseFloat(other.latitude));
      const lngDiff = Math.abs(parseFloat(selectedTicket.longitude) - parseFloat(other.longitude));
      isNearby = latDiff < 0.005 && lngDiff < 0.005; // ~500m
    } else {
      // Fallback: Check if address has common street/location strings
      isNearby = other.location?.toLowerCase().trim() === selectedTicket.location?.toLowerCase().trim();
    }
    
    // Check keyword similarity or same category
    const sameCategory = other.category === selectedTicket.category;
    const descWordsOther = other.description?.toLowerCase().split(/\s+/) || [];
    const descWordsSelf = selectedTicket.description?.toLowerCase().split(/\s+/) || [];
    const commonWords = descWordsSelf.filter(w => w.length > 4 && descWordsOther.includes(w));
    const similarity = commonWords.length / Math.max(1, descWordsSelf.length);
    
    return (isNearby && similarity > 0.25) || (isNearby && sameCategory);
  }) : [];

  // Fetch AI suggested solution when selected ticket changes
  useEffect(() => {
    if (!selectedTicket) {
      setAiSolution('');
      return;
    }

    const fetchSuggestion = async () => {
      setAiLoading(true);
      setAiSolution('');
      try {
        const res = await suggestSolution(selectedTicket.description);
        setAiSolution(res.solution);
      } catch (err) {
        console.error(err);
        setAiSolution('Failed to load AI suggested solution.');
      } finally {
        setAiLoading(false);
      }
    };

    fetchSuggestion();
  }, [selectedId]);

  const handleStatusChange = (statusVal) => {
    if (statusVal === 'Resolved') {
      setShowProofForm(true);
      setResolutionInput(selectedTicket?.resolutionNote || '');
    } else {
      setShowProofForm(false);
      updateComplaintStatus(selectedTicket.id, statusVal);
    }
  };

  const submitResolutionProof = () => {
    updateComplaintStatus(selectedTicket.id, 'Resolved', {
      resolutionNote: resolutionInput || 'Resolved by city command operations.',
      resolutionDate: new Date().toISOString()
    });
    setShowProofForm(false);
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || c.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="operations-dashboard-grid">
      {/* Left Pane: Filterable List */}
      <div className="ops-list-pane">
        <div className="list-card-wrapper ops-list-wrapper">
          <div className="list-header">
            <h3>Grievance Queue</h3>
            <span className="ticket-count">{filteredComplaints.length} issues</span>
          </div>

          {/* Filtering Controls */}
          <div className="ops-filter-controls">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search description, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="ops-selectors">
              <div className="filter-box">
                <Filter size={12} className="filter-icon" />
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

              <div className="filter-box">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="AI Analyzed">AI Analyzed</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Pending">Pending Review</option>
                </select>
              </div>
            </div>
          </div>

          {/* Scroll container */}
          <div className="complaint-scroll-container ops-scroll-container">
            {filteredComplaints.length === 0 ? (
              <div className="empty-list-state">
                <FolderOpen size={28} className="text-muted" />
                <p>No active grievances in queue.</p>
              </div>
            ) : (
              filteredComplaints.map((c) => (
                <ComplaintCard
                  key={c.id}
                  complaint={c}
                  isSelected={selectedId === c.id}
                  onClick={() => setSelectedId(c.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Pane: Inspector Panel */}
      <div className="ops-inspector-pane">
        {selectedTicket ? (
          <div className="inspector-panel-card">
            <div className="inspector-header">
              <div className="ticket-meta" style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                <span className="ticket-id-tag">TICKET #{selectedTicket.id.toString().slice(-6)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span className="timestamp">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                  {selectedTicket.timeElapsedStr && (
                    <span style={{ 
                      fontSize: '11px', 
                      background: selectedTicket.isSlaDelayed ? 'rgba(185, 101, 75, 0.1)' : 'var(--surface-elevated)', 
                      color: selectedTicket.isSlaDelayed ? '#B9654B' : 'var(--text-secondary)',
                      fontWeight: selectedTicket.isSlaDelayed ? '700' : '400',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: selectedTicket.isSlaDelayed ? '1px solid rgba(185,101,75,0.2)' : '1px solid var(--glass-border)'
                    }}>
                      Elapsed: {selectedTicket.timeElapsedStr} {selectedTicket.isSlaDelayed ? '(DELAYED)' : ''}
                    </span>
                  )}
                </div>
              </div>
              <div className="inspector-badge-row">
                <span className={`status-badge-visual status-${selectedTicket.status.toLowerCase().replace(' ', '-')}`}>
                  {selectedTicket.status}
                </span>
              </div>
            </div>

            <div className="inspector-content">
              {/* Heading and Location */}
              <h3 className="inspector-title">{selectedTicket.title}</h3>
              <div className="inspector-location-row">
                <MapPin size={14} className="text-cyan" />
                <span>{selectedTicket.location}</span>
              </div>

              {/* Description */}
              <div className="inspector-section">
                <span className="section-label">Citizen Statement</span>
                <p className="description-text">{selectedTicket.description}</p>
                {selectedTicket.image && (
                  <div className="inspector-image-box" style={{ marginTop: '12px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                    <img src={selectedTicket.image} alt="Reported Scene" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
                  </div>
                )}
              </div>

              {/* Dynamic Action Controls */}
              <div className="inspector-controls-grid" style={{ marginBottom: showProofForm ? '8px' : '20px' }}>
                <div className="control-group">
                  <span className="section-label">Resolution Status</span>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="admin-select select-status"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="AI Analyzed">AI Analyzed</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    {selectedTicket.status === 'Pending' && <option value="Pending">Pending Review</option>}
                  </select>
                </div>

                <div className="control-group">
                  <span className="section-label">Municipal Department</span>
                  <select
                    value={selectedTicket.category}
                    onChange={(e) => updateComplaintCategory(selectedTicket.id, e.target.value)}
                    className="admin-select"
                  >
                    <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                    <option value="Water & Sanitation">Water & Sanitation</option>
                    <option value="Public Safety">Public Safety</option>
                    <option value="Waste Management">Waste Management</option>
                    <option value="Lighting & Electricity">Lighting & Electricity</option>
                  </select>
                </div>
              </div>

              {/* Operational Status Timeline Stepper */}
              <div className="inspector-section" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginBottom: '20px' }}>
                <span className="section-label" style={{ fontWeight: '700', marginBottom: '12px', display: 'block' }}>Operational Stage Timeline</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', padding: '0 8px', marginTop: '8px' }}>
                  {/* Stepper bar */}
                  <div style={{ position: 'absolute', top: '10px', left: '20px', right: '20px', height: '2px', background: 'var(--glass-border)', zIndex: '1' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${(([
                        'submitted', 'ai analyzed', 'assigned', 'in progress', 'resolved'
                      ].indexOf(selectedTicket.status?.toLowerCase()) >= 0 ? [
                        'submitted', 'ai analyzed', 'assigned', 'in progress', 'resolved'
                      ].indexOf(selectedTicket.status?.toLowerCase()) : 0) / 4) * 100}%`, 
                      background: 'var(--accent-cyan)',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                  
                  {['Sub', 'AI', 'Asgn', 'Prog', 'Res'].map((label, stepIdx) => {
                    const activeStep = [
                      'submitted', 'ai analyzed', 'assigned', 'in progress', 'resolved'
                    ].indexOf(selectedTicket.status?.toLowerCase()) >= 0 ? [
                      'submitted', 'ai analyzed', 'assigned', 'in progress', 'resolved'
                    ].indexOf(selectedTicket.status?.toLowerCase()) + 1 : 1;
                    
                    const isDone = stepIdx + 1 <= activeStep;
                    const isCurrent = stepIdx + 1 === activeStep;
                    
                    return (
                      <div key={stepIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: '2', position: 'relative' }}>
                        <div style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '50%', 
                          background: isDone ? 'var(--accent-cyan)' : 'var(--surface-elevated)', 
                          border: isCurrent ? '2px solid #FFF9F4' : '1px solid var(--glass-border)',
                          boxShadow: isCurrent ? '0 0 8px var(--accent-cyan)' : 'none',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          color: isDone ? '#FFF' : 'var(--text-muted)',
                          transition: 'all 0.3s ease'
                        }}>
                          {stepIdx + 1}
                        </div>
                        <span style={{ fontSize: '9.5px', marginTop: '6px', fontWeight: isCurrent ? '700' : '400', color: isCurrent ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {showProofForm && (
                <div className="inspector-section" style={{ border: '1px solid rgba(46, 125, 50, 0.2)', padding: '12px', borderRadius: '4px', background: 'rgba(46, 125, 50, 0.02)', marginBottom: '16px' }}>
                  <span className="section-label" style={{ color: '#2e7d32', fontWeight: '700' }}>Resolution Proof Details</span>
                  <textarea
                    rows="2"
                    placeholder="Enter resolution notes, crew directives or evidence links..."
                    value={resolutionInput}
                    onChange={(e) => setResolutionInput(e.target.value)}
                    style={{ border: '1px solid rgba(46, 125, 50, 0.3)', marginTop: '6px', width: '100%', padding: '8px', background: 'var(--surface-elevated)', color: 'var(--text-primary)', borderRadius: '4px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button 
                      onClick={submitResolutionProof}
                      className="btn btn-primary"
                      style={{ fontSize: '11px', padding: '6px 12px', background: '#2e7d32', borderColor: '#2e7d32', color: '#FFFFFF' }}
                    >
                      Save & Resolve
                    </button>
                    <button 
                      onClick={() => setShowProofForm(false)}
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '6px 12px' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {selectedTicket.status === 'Resolved' && !showProofForm && (
                <div className="inspector-section" style={{ background: 'rgba(46, 125, 50, 0.04)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(46, 125, 50, 0.15)', marginBottom: '16px' }}>
                  <span className="section-label" style={{ color: '#2e7d32', fontWeight: '700' }}>Archived Resolution Proof</span>
                  <p style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '4px', color: 'var(--text-primary)' }}>
                    "{selectedTicket.resolutionNote || 'Municipal action marked resolved.'}"
                  </p>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Closed on: {selectedTicket.resolutionDate ? new Date(selectedTicket.resolutionDate).toLocaleDateString() : new Date(selectedTicket.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Gemini AI Triage Report Details */}
              <div className="inspector-section-ai-report">
                <div className="ai-report-header">
                  <Sparkles size={14} className="text-cyan" />
                  <span>Gemini AI Auto-Triage Log {selectedTicket.confidence ? `(Confidence: ${selectedTicket.confidence})` : ''}</span>
                </div>
                <div className="ai-report-body">
                  {selectedTicket.detectedIssue && (
                    <div className="report-log-item">
                      <span className="log-label">Detected Incident:</span>
                      <p className="log-desc" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{selectedTicket.detectedIssue}</p>
                    </div>
                  )}
                  <div className="report-log-item">
                    <span className="log-label">AI Urgency Rating:</span>
                    <span className={`urgency-text-color-${selectedTicket.urgency?.toLowerCase()}`}>
                      {selectedTicket.urgency}
                    </span>
                  </div>
                  <div className="report-log-item">
                    <span className="log-label">AI Summary:</span>
                    <p className="log-desc">{selectedTicket.aiSummary}</p>
                  </div>
                  <div className="report-log-item">
                    <span className="log-label">Insights:</span>
                    <div className="tags-row" style={{ marginTop: '4px', gap: '8px' }}>
                      {selectedTicket.tags && selectedTicket.tags.map((tag, idx) => (
                        <span key={idx} className="ai-pill-tag" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px' }}>#{tag}</span>
                      ))}
                      <span className="ai-pill-tag sentiment-pill" style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)', color: 'var(--accent-cyan)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px' }}>{selectedTicket.sentiment || 'Neutral'} Sentiment</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gemini AI Suggested Action Advisory */}
              <div className="inspector-section-ai-advisory">
                <div className="ai-advisory-header">
                  <Settings size={14} className="text-purple spinner-pulse" />
                  <span>Gemini Co-Pilot Suggested Action</span>
                </div>
                <div className="ai-advisory-body">
                  {aiLoading ? (
                    <div className="ai-advisory-loading">
                      <span className="spinner"></span>
                      <span>Formulating response directives...</span>
                    </div>
                  ) : (
                    <p className="ai-directive-text">{aiSolution}</p>
                  )}
                </div>
              </div>

              {/* Related Complaints List Section */}
              <div className="inspector-section-related-complaints" style={{ border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '6px', background: 'var(--surface-color)', marginTop: '20px' }}>
                <span className="section-label" style={{ fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                  Related Complaints ({relatedTickets.length})
                </span>
                {relatedTickets.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>No overlapping or nearby related grievances detected.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {relatedTickets.map((ticket) => (
                      <div 
                        key={ticket.id} 
                        style={{ padding: '8px 10px', background: 'var(--surface-elevated)', borderRadius: '4px', borderLeft: '3px solid var(--accent-cyan)', fontSize: '12px' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', color: 'var(--text-primary)' }}>
                          <span>{ticket.title}</span>
                          <span style={{ color: 'var(--text-muted)' }}>#{ticket.id.toString().slice(-4)}</span>
                        </div>
                        <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '11px' }}>
                          Location: {ticket.location} | Status: {ticket.status}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="inspector-panel-card empty-inspector">
            <AlertTriangle size={32} className="text-muted" />
            <h3>No Complaint Selected</h3>
            <p>Select a grievance ticket from the queue on the left to analyze diagnostic reports, run Gemini co-pilot suggested actions, and dispatch responders.</p>
          </div>
        )}
      </div>
    </div>
  );
}
