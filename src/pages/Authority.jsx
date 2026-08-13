import React, { useState } from 'react';
import Dashboard from '../components/Dashboard';
import MapView from '../components/MapView';
import Analytics from '../components/Analytics';
import { 
  Building2, 
  Map, 
  BarChart3, 
  ArrowLeft,
  AlertCircle,
  Clock,
  CheckCircle2,
  ListTodo
} from 'lucide-react';

export default function Authority({ complaints, updateComplaintStatus, updateComplaintCategory, setView }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'map' | 'analytics'

  // Calculate metrics based on live complaints state
  const totalTickets = complaints.length;
  const pendingTickets = complaints.filter(c => c.status === 'Pending').length;
  const inProgressTickets = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedTickets = complaints.filter(c => c.status === 'Resolved').length;

  const criticalAlerts = complaints.filter(
    c => (c.urgency === 'High' || c.urgency === 'Critical') && c.status !== 'Resolved'
  ).length;

  const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

  return (
    <div className="authority-portal container">
      {/* Portal Header */}
      <div className="portal-header">
        <button className="back-to-home" onClick={() => setView('home')}>
          <ArrowLeft size={16} />
          <span>Back to Landing</span>
        </button>
        <div className="title-area-row">
          <div className="title-area">
            <h2>City Operations Intelligence Hub</h2>
            <p>Authority Command Center for sorting, routing, analyzing, and resolving citizen grievances in real-time.</p>
          </div>
          
          {/* Tabs */}
          <div className="portal-tabs">
            <button 
              className={`tab-btn ${activeTab === 'dashboard' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <ListTodo size={14} />
              <span>Grievances</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'map' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('map')}
            >
              <Map size={14} />
              <span>Hotspot Map</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'analytics' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 size={14} />
              <span>City Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="metrics-banner-grid">
        <div className="metric-card card-cyan">
          <div className="metric-card-content">
            <span className="metric-label">Active Cases</span>
            <span className="metric-value">{totalTickets - resolvedTickets}</span>
            <span className="metric-subtext">Pending or In Progress</span>
          </div>
          <Building2 size={24} className="metric-card-icon" />
        </div>

        <div className="metric-card card-red">
          <div className="metric-card-content">
            <span className="metric-label">Critical Alerts</span>
            <span className="metric-value">{criticalAlerts}</span>
            <span className="metric-subtext">Urgent response required</span>
          </div>
          <AlertCircle size={24} className="metric-card-icon text-red" />
        </div>

        <div className="metric-card card-yellow">
          <div className="metric-card-content">
            <span className="metric-label font-bold">In Progress</span>
            <span className="metric-value">{inProgressTickets}</span>
            <span className="metric-subtext">Crews dispatched on site</span>
          </div>
          <Clock size={24} className="metric-card-icon text-yellow" />
        </div>

        <div className="metric-card card-green">
          <div className="metric-card-content">
            <span className="metric-label">Resolution Rate</span>
            <span className="metric-value">{resolutionRate}%</span>
            <span className="metric-subtext">{resolvedTickets} of {totalTickets} tickets resolved</span>
          </div>
          <CheckCircle2 size={24} className="metric-card-icon text-green" />
        </div>
      </div>

      {/* Tab Render Conditionals */}
      <div className="tab-render-container">
        {activeTab === 'dashboard' && (
          <Dashboard 
            complaints={complaints} 
            updateComplaintStatus={updateComplaintStatus}
            updateComplaintCategory={updateComplaintCategory}
          />
        )}
        
        {activeTab === 'map' && (
          <MapView complaints={complaints} />
        )}
        
        {activeTab === 'analytics' && (
          <Analytics complaints={complaints} />
        )}
      </div>
    </div>
  );
}
