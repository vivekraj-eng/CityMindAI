import React, { useState } from 'react';
import { CheckCircle, Search, Calendar, User, FileText, Image } from 'lucide-react';

export default function ResolvedLedger({ complaints }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const resolvedList = complaints.filter(
    c => c.status === 'Resolved'
  );

  const filteredResolved = resolvedList.filter((c) => {
    const term = searchTerm.toLowerCase();
    return c.title.toLowerCase().includes(term) || 
           c.description.toLowerCase().includes(term) || 
           c.location.toLowerCase().includes(term) ||
           (c.resolutionNote && c.resolutionNote.toLowerCase().includes(term));
  });

  return (
    <div className="resolved-ledger-container">
      <div className="overview-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div className="title-area">
          <h2 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '4px' }}>Resolution Ledger</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Completed municipal actions, validation notes, and resolution evidence logs.</p>
        </div>
      </div>

      <div className="list-card-wrapper" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ maxWidth: '360px', flex: '1' }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search title, notes, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            <strong>{filteredResolved.length}</strong> resolved cases archived
          </span>
        </div>

        {filteredResolved.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
            <CheckCircle size={36} className="text-muted" style={{ marginBottom: '12px' }} />
            <p>No archived resolution cases found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredResolved.map((ticket) => (
              <div key={ticket.id} style={{ border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '16px', background: 'var(--surface-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed var(--glass-border)', paddingBottom: '10px', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>CASE #{ticket.id.toString().slice(-6)}</span>
                    <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>{ticket.title}</h4>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', background: 'rgba(46, 125, 50, 0.08)', color: '#2e7d32', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(46, 125, 50, 0.2)', fontWeight: '600' }}>
                    <CheckCircle size={10} /> Resolved
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Citizen Statement</span>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>{ticket.description}</p>
                    </div>

                    <div style={{ background: 'rgba(46, 125, 50, 0.03)', border: '1px solid rgba(46, 125, 50, 0.12)', borderRadius: '4px', padding: '10px 12px' }}>
                      <span style={{ fontSize: '11px', color: '#2e7d32', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileText size={12} /> Resolution Validation Note
                      </span>
                      <p style={{ color: 'var(--text-primary)', marginTop: '4px', fontStyle: 'italic', fontSize: '12.5px' }}>
                        "{ticket.resolutionNote || 'Municipal task marked resolved via command dashboard.'}"
                      </p>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', borderLeft: '1px solid var(--glass-border)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Location: </span>
                      <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{ticket.location}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Department: </span>
                      <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{ticket.category}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Resolution Date: </span>
                      <span style={{ fontWeight: '500', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {ticket.resolutionDate ? new Date(ticket.resolutionDate).toLocaleDateString() : new Date(ticket.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {ticket.image && (
                      <div style={{ marginTop: '4px', border: '1px solid var(--glass-border)', borderRadius: '4px', overflow: 'hidden' }}>
                        <img src={ticket.image} alt="Evidence" style={{ width: '100%', height: '80px', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
