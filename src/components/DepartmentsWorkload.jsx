import React from 'react';
import { Building2 } from 'lucide-react';

export default function DepartmentsWorkload({ complaints }) {
  const departments = [
    { name: 'Roads & Infrastructure', display: 'Roads', icon: Building2 },
    { name: 'Water & Sanitation', display: 'Water & Sanitation', icon: Building2 },
    { name: 'Public Safety', display: 'Public Safety', icon: Building2 },
    { name: 'Lighting & Electricity', display: 'Electrical', icon: Building2 }
  ];

  return (
    <div className="departments-workload-container">
      <div className="overview-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div className="title-area">
          <h2 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '4px' }}>Department Workload</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Municipal workload levels: Active, Assigned, In Progress, and Resolved cases per division.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {departments.map((dept, idx) => {
          const deptComplaints = complaints.filter(
            c => c.category === dept.name || c.category?.split(' & ')[0] === dept.display
          );
          
          const activeCount = deptComplaints.filter(c => c.status !== 'Resolved').length;
          const assignedCount = deptComplaints.filter(c => c.status === 'Assigned').length;
          const inProgressCount = deptComplaints.filter(c => c.status === 'In Progress').length;
          const resolvedCount = deptComplaints.filter(c => c.status === 'Resolved').length;
          
          const totalUnresolved = complaints.filter(c => c.status !== 'Resolved').length;
          const workloadPercent = totalUnresolved > 0 ? Math.round((activeCount / totalUnresolved) * 100) : 0;

          return (
            <div key={idx} className="list-card-wrapper" style={{ padding: '20px', background: 'var(--surface-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
                <div style={{ padding: '8px', background: 'rgba(185, 101, 75, 0.08)', borderRadius: '6px', color: 'var(--accent-cyan)' }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{dept.display} Division</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{dept.name}</span>
                </div>
              </div>

              {/* Workload percentage */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Departmental Share of City Active Load</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{workloadPercent}%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--surface-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.max(4, workloadPercent)}%`, background: 'var(--accent-cyan)', borderRadius: '4px' }}></div>
                </div>
              </div>

              {/* 4-column counts row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                <div style={{ padding: '8px 4px', background: 'var(--surface-elevated)', borderRadius: '4px' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Active</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{activeCount}</span>
                </div>
                <div style={{ padding: '8px 4px', background: 'var(--surface-elevated)', borderRadius: '4px' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Assigned</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#526A78' }}>{assignedCount}</span>
                </div>
                <div style={{ padding: '8px 4px', background: 'var(--surface-elevated)', borderRadius: '4px' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Progress</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#B9654B' }}>{inProgressCount}</span>
                </div>
                <div style={{ padding: '8px 4px', background: 'var(--surface-elevated)', borderRadius: '4px' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Resolved</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#2e7d32' }}>{resolvedCount}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
