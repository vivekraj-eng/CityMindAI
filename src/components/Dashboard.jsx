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
              <div className="ticket-meta">
                <span className="ticket-id-tag">TICKET #{selectedTicket.id.toString().slice(-6)}</span>
                <span className="timestamp">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
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
