import React from 'react';
import { MapPin, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function ComplaintCard({ complaint, isSelected, onClick }) {
  const { title, category, location, urgency, status, createdAt } = complaint;

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return <span className="status-badge status-resolved"><CheckCircle2 size={10} /> Resolved</span>;
      case 'in progress':
        return <span className="status-badge status-progress"><Clock size={10} /> In Progress</span>;
      default:
        return <span className="status-badge status-pending"><AlertCircle size={10} /> Pending</span>;
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
      case 'critical':
        return <span className="urgency-dot-badge text-red"><span className="dot dot-red animate-pulse-fast"></span> Critical</span>;
      case 'medium':
        return <span className="urgency-dot-badge text-yellow"><span className="dot dot-yellow"></span> Medium</span>;
      default:
        return <span className="urgency-dot-badge text-blue"><span className="dot dot-blue"></span> Low</span>;
    }
  };

  return (
    <div 
      className={`authority-complaint-card ${isSelected ? 'is-selected' : ''}`}
      onClick={onClick}
    >
      <div className="card-top-row">
        <span className="card-cat">{category}</span>
        {getUrgencyBadge(urgency)}
      </div>
      <h4 className="card-title-text">{title}</h4>
      <div className="card-meta-row">
        <div className="meta-item">
          <MapPin size={12} />
          <span>{location}</span>
        </div>
        <div className="meta-item">
          <Calendar size={12} />
          <span>{formatDate(createdAt)}</span>
        </div>
      </div>
      <div className="card-bottom-row">
        {getStatusBadge(status)}
        <span className="inspect-hint">Inspect Ticket</span>
      </div>
    </div>
  );
}
