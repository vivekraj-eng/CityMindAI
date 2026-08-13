import React from 'react';
import { BarChart3, TrendingUp, ShieldAlert, Award, Clock } from 'lucide-react';

export default function Analytics({ complaints }) {
  const total = complaints.length;
  
  // Counts by category
  const categories = [
    'Roads & Infrastructure',
    'Water & Sanitation',
    'Public Safety',
    'Waste Management',
    'Lighting & Electricity'
  ];

  const categoryCounts = categories.map(cat => {
    const count = complaints.filter(c => c.category === cat).length;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return { name: cat, count, percentage };
  });

  // Counts by urgency
  const urgencies = ['High', 'Medium', 'Low'];
  const urgencyCounts = urgencies.map(urg => {
    const count = complaints.filter(c => c.urgency?.toLowerCase() === urg.toLowerCase()).length;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return { name: urg, count, percentage };
  });

  // Counts by status
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const openCount = total - resolvedCount;

  const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

  return (
    <div className="analytics-component">
      <div className="analytics-header-row">
        <h3>Platform Performance Analytics</h3>
        <span className="demo-badge">Real-time Telemetry Dashboard</span>
      </div>

      <div className="analytics-main-grid">
        {/* Category Breakdown Bar Chart */}
        <div className="analytics-card-item">
          <div className="card-title-row">
            <BarChart3 size={16} className="text-cyan" />
            <h4>Grievance Volume by Category</h4>
          </div>
          
          <div className="chart-bar-list">
            {categoryCounts.map((cat, idx) => (
              <div key={idx} className="chart-bar-row">
                <div className="chart-bar-labels">
                  <span className="cat-name-label">{cat.name}</span>
                  <span className="cat-count-label">{cat.count} issues ({cat.percentage}%)</span>
                </div>
                <div className="bar-track">
                  <div 
                    className="bar-fill cyan-fill-gradient" 
                    style={{ width: `${Math.max(4, cat.percentage)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgency Distribution Card */}
        <div className="analytics-card-item">
          <div className="card-title-row">
            <ShieldAlert size={16} className="text-purple" />
            <h4>Urgency Spectrum Allocation</h4>
          </div>

          <div className="chart-bar-list">
            {urgencyCounts.map((urg, idx) => {
              const fillClass = urg.name === 'High' 
                ? 'red-fill-gradient' 
                : urg.name === 'Medium' 
                  ? 'yellow-fill-gradient' 
                  : 'blue-fill-gradient';

              return (
                <div key={idx} className="chart-bar-row">
                  <div className="chart-bar-labels">
                    <span className="cat-name-label">{urg.name} Urgency</span>
                    <span className="cat-count-label">{urg.count} issues ({urg.percentage}%)</span>
                  </div>
                  <div className="bar-track">
                    <div 
                      className={`bar-fill ${fillClass}`} 
                      style={{ width: `${Math.max(4, urg.percentage)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resolution Rate Linear Gauge */}
        <div className="analytics-card-item grid-span-full">
          <div className="card-title-row">
            <TrendingUp size={16} className="text-green" />
            <h4>Operational Resolution Rate</h4>
          </div>

          <div className="resolution-gauge-wrapper">
            <div className="gauge-circle-col">
              <div className="huge-stat-box">
                <span className="huge-number text-green">{resolutionRate}%</span>
                <span className="huge-label">Resolution Rate</span>
              </div>
            </div>

            <div className="gauge-stats-col">
              <div className="gauge-bars-container">
                <div className="gauge-track">
                  <div className="gauge-fill-green" style={{ width: `${resolutionRate}%` }}></div>
                </div>
                <div className="gauge-markers">
                  <span className="marker-label">Open Cases ({openCount})</span>
                  <span className="marker-label">Resolved ({resolvedCount})</span>
                </div>
              </div>

              <div className="gauge-grid-stats">
                <div className="sub-stat-card">
                  <span className="sub-stat-num">{pendingCount}</span>
                  <span className="sub-stat-lbl">Pending Review</span>
                </div>
                <div className="sub-stat-card">
                  <span className="sub-stat-num text-yellow">{inProgressCount}</span>
                  <span className="sub-stat-lbl">In Progress</span>
                </div>
                <div className="sub-stat-card">
                  <span className="sub-stat-num text-green">{resolvedCount}</span>
                  <span className="sub-stat-lbl">Successfully Resolved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
