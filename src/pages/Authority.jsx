import React, { useState } from 'react';
import Dashboard from '../components/Dashboard';
import MapView from '../components/MapView';
import Analytics from '../components/Analytics';
import Overview from '../components/Overview';
import ResolvedLedger from '../components/ResolvedLedger';
import DepartmentsWorkload from '../components/DepartmentsWorkload';
import AICopilotPanel from '../components/AICopilotPanel';
import { 
  Building2, 
  Map, 
  BarChart3, 
  ArrowLeft,
  AlertCircle,
  Clock,
  CheckCircle2,
  ListTodo,
  Sparkles,
  Settings,
  User,
  LayoutDashboard,
  Menu,
  X,
  Shield
} from 'lucide-react';

export default function Authority({ complaints, updateComplaintStatus, updateComplaintCategory, setView }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'complaints' | 'map' | 'departments' | 'copilot' | 'analytics' | 'resolved'
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigateToTab = (tabName) => {
    setActiveTab(tabName);
    setIsSidebarOpen(false);
  };

  const handleSelectTicket = (id) => {
    setSelectedTicketId(id);
    setActiveTab('complaints');
  };

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'complaints', name: 'Complaints', icon: ListTodo },
    { id: 'map', name: 'Live Map', icon: Map },
    { id: 'departments', name: 'Departments', icon: Building2 },
    { id: 'copilot', name: 'AI Co-pilot', icon: Sparkles },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'resolved', name: 'Resolved', icon: CheckCircle2 }
  ];

  return (
    <div className="authority-command-layout" style={{ display: 'flex', minHeight: 'calc(100vh - 120px)', gap: '24px', marginTop: '24px', position: 'relative' }}>
      
      {/* Mobile Sidebar Hamburger Toggle */}
      <button 
        className="mobile-sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: '999',
          padding: '12px',
          borderRadius: '50%',
          background: 'var(--accent-cyan)',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 4px 12px rgba(185,101,75,0.3)',
          cursor: 'pointer',
          display: 'none' // Controlled in responsive CSS
        }}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* LEFT SIDEBAR navigation */}
      <aside 
        className={`command-sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}
        style={{
          width: '260px',
          background: 'var(--surface-color)',
          border: '1px solid var(--glass-border)',
          borderRadius: '8px',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Header and Back navigation */}
          <div>
            <button className="back-to-home w-full" onClick={() => setView('home')} style={{ marginBottom: '16px', justifyContent: 'center' }}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px' }}>
              <div style={{ padding: '6px', background: 'rgba(185, 101, 75, 0.08)', borderRadius: '6px', color: 'var(--accent-cyan)' }}>
                <Shield size={18} />
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>CityMind Command</span>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Terminal v2.4</span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: isActive ? 'rgba(185, 101, 75, 0.06)' : 'transparent',
                    border: isActive ? '1px solid rgba(185, 101, 75, 0.12)' : '1px solid transparent',
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: isActive ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                >
                  <IconComp size={16} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Menu Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
          <button
            onClick={() => alert("Settings configuration panel is locked. Demo credentials active.")}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '12.5px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Settings size={15} />
            <span>Settings</span>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', marginTop: '4px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--surface-elevated)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyBox: 'center', color: 'var(--text-secondary)', justifyContent: 'center' }}>
              <User size={14} />
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>City Admin</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Level 1 Clearance</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace View */}
      <main style={{ flex: '1', minWidth: '0', background: 'transparent' }}>
        {activeTab === 'overview' && (
          <Overview 
            complaints={complaints} 
            onNavigateToTab={navigateToTab}
            onSelectTicket={handleSelectTicket}
          />
        )}
        
        {activeTab === 'complaints' && (
          <Dashboard 
            complaints={complaints} 
            updateComplaintStatus={updateComplaintStatus}
            updateComplaintCategory={updateComplaintCategory}
            preselectedId={selectedTicketId}
          />
        )}
        
        {activeTab === 'map' && (
          <MapView complaints={complaints} onSelectTicket={handleSelectTicket} />
        )}

        {activeTab === 'departments' && (
          <DepartmentsWorkload complaints={complaints} />
        )}

        {activeTab === 'copilot' && (
          <AICopilotPanel complaints={complaints} updateComplaintStatus={updateComplaintStatus} />
        )}
        
        {activeTab === 'analytics' && (
          <Analytics complaints={complaints} />
        )}

        {activeTab === 'resolved' && (
          <ResolvedLedger complaints={complaints} />
        )}
      </main>
    </div>
  );
}
