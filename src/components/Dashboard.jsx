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

export default function Dashboard({ complaints, updateComplaintStatus, updateComplaintCategory }) {
  const [selectedId, setSelectedId] = useState(complaints[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

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
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
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
              </div>

              {/* Dynamic Action Controls */}
              <div className="inspector-controls-grid">
                <div className="control-group">
                  <span className="section-label">Resolution Status</span>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => updateComplaintStatus(selectedTicket.id, e.target.value)}
                    className="admin-select select-status"
                  >
                    <option value="Pending">Pending Review</option>
                    <option value="In Progress">Dispatch crew (In Progress)</option>
                    <option value="Resolved">Mark Resolved</option>
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

              {/* Gemini AI Triage Report Details */}
              <div className="inspector-section-ai-report">
                <div className="ai-report-header">
                  <Sparkles size={14} className="text-cyan" />
                  <span>Gemini AI Auto-Triage Log</span>
                </div>
                <div className="ai-report-body">
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
