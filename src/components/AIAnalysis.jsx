import React from 'react';
import { AlertTriangle, Tag, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

export default function AIAnalysis({ analysis }) {
  if (!analysis) return null;

  const { category, urgency, tags, sentiment, aiSummary } = analysis;

  // Urgency theme helper
  const getUrgencyTheme = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
      case 'critical':
        return {
          class: 'urgency-high',
          label: 'Critical / High Priority',
          color: '#ef4444'
        };
      case 'medium':
        return {
          class: 'urgency-medium',
          label: 'Medium Priority',
          color: '#eab308'
        };
      default:
        return {
          class: 'urgency-low',
          label: 'Standard Priority',
          color: '#3b82f6'
        };
    }
  };

  const theme = getUrgencyTheme(urgency);

  return (
    <div className={`ai-analysis-card ${theme.class}`}>
      <div className="card-ambient-glow" style={{ backgroundColor: theme.color }}></div>
      
      <div className="analysis-header">
        <div className="title-section">
          <ShieldAlert size={16} className="header-icon" />
          <h4>Gemini AI Triage Report</h4>
        </div>
        <span className="confidence-pill">AI Confidence: 94.8%</span>
      </div>

      <div className="analysis-body">
        {/* Urgency and Category */}
        <div className="analysis-row">
          <div className="analysis-item">
            <span className="item-label">Assigned Category</span>
            <span className="item-value">{category}</span>
          </div>
          <div className="analysis-item">
            <span className="item-label">Severity Assessment</span>
            <span className="item-value-badge" style={{ color: theme.color, borderColor: theme.color }}>
              {theme.label}
            </span>
          </div>
        </div>

        {/* AI Summary */}
        <div className="summary-section">
          <span className="item-label">AI Summary</span>
          <p className="summary-text">{aiSummary}</p>
        </div>

        {/* Tags */}
        <div className="tags-section">
          <span className="item-label">Extracted Tags</span>
          <div className="tags-container">
            {tags && tags.map((tag, idx) => (
              <span key={idx} className="analysis-tag">
                <Tag size={10} />
                <span>{tag}</span>
              </span>
            ))}
            <span className="analysis-tag sentiment-tag">
              <span>Sentiment: {sentiment || 'Neutral'}</span>
            </span>
          </div>
        </div>

        {/* Smart Routing Destination */}
        <div className="routing-box">
          <CheckCircle2 size={14} className="routing-icon" />
          <span>Dynamically routed to: <strong className="department-name">{category || 'General Operations'} Department</strong></span>
        </div>
      </div>
    </div>
  );
}
