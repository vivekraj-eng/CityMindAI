import React, { useState } from 'react';
import Dashboard from '../components/Dashboard';
import MapView from '../components/MapView';
import Analytics from '../components/Analytics';
import Overview from '../components/Overview';
import ResolvedLedger from '../components/ResolvedLedger';
import DepartmentsWorkload from '../components/DepartmentsWorkload';
import AICopilotPanel from '../components/AICopilotPanel';
import NotificationCenter from '../components/NotificationCenter';
import ProfilePage from '../components/ProfilePage';
import SettingsPage from '../components/SettingsPage';
import { 
  Building2, 
  Map, 
  BarChart3, 
  ArrowLeft,
  ClipboardList,
  Sparkles,
  Settings,
  User,
  LayoutDashboard,
  Menu,
  X,
  Shield,
  CheckCircle,
  Search,
  LogOut
} from 'lucide-react';

export default function Authority({ 
  complaints, 
  updateComplaintStatus, 
  updateComplaintCategory, 
  setView, 
  activeTab = 'overview', 
  setActiveTab,
  user,
  setUser
}) {
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const navigateToTab = (tabName) => {
    if (setActiveTab) {
      setActiveTab(tabName);
    }
    setIsSidebarOpen(false);
  };

  const handleSelectTicket = (id) => {
    setSelectedTicketId(id);
    navigateToTab('complaints');
  };

  const handleSignOut = () => {
    if (setUser) {
      setUser(null);
      localStorage.removeItem('citymind_user');
      localStorage.removeItem('citymind_token');
    }
    setView('/login');
  };

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'complaints', name: 'Complaints', icon: ClipboardList },
    { id: 'map', name: 'Live Map', icon: Map },
    { id: 'departments', name: 'Departments', icon: Building2 },
    { id: 'copilot', name: 'AI Co-pilot', icon: Sparkles },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'resolved', name: 'Resolved', icon: CheckCircle },
    { id: 'settings', name: 'Settings', icon: Settings }
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
          display: 'none'
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
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Terminal v2.5</span>
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

        {/* Bottom Sign Out Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              background: 'transparent',
              border: 'none',
              color: '#B9654B',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              fontWeight: '500'
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace View */}
      <main style={{ flex: '1', minWidth: '0', background: 'transparent', display: 'flex', flexDirection: 'column' }}>
        
        {/* Global Operational Search Bar */}
        <div className="global-search-container" style={{ marginBottom: '24px', position: 'relative' }}>
          <div style={{ display: 'flex', background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '8px 14px', alignItems: 'center', gap: '10px', boxShadow: '0 2px 8px rgba(185,101,75,0.02)' }}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search across Case IDs, issues, locations, status, or departments..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            {globalSearch && (
              <button onClick={() => setGlobalSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Dropdown Overlay Results */}
          {globalSearch.trim() && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              background: 'var(--surface-color)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(185,101,75,0.12)',
              zIndex: '990',
              maxHeight: '280px',
              overflowY: 'auto',
              padding: '6px'
            }}>
              {complaints.filter(c => {
                const term = globalSearch.toLowerCase().trim();
                return c.id.toString().toLowerCase().includes(term) ||
                       c.title?.toLowerCase().includes(term) ||
                       c.category?.toLowerCase().includes(term) ||
                       c.location?.toLowerCase().includes(term) ||
                       c.status?.toLowerCase().includes(term);
              }).length === 0 ? (
                <div style={{ padding: '12px', fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No matching grievances found.
                </div>
              ) : (
                complaints.filter(c => {
                  const term = globalSearch.toLowerCase().trim();
                  return c.id.toString().toLowerCase().includes(term) ||
                         c.title?.toLowerCase().includes(term) ||
                         c.category?.toLowerCase().includes(term) ||
                         c.location?.toLowerCase().includes(term) ||
                         c.status?.toLowerCase().includes(term);
                }).map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setGlobalSearch('');
                      handleSelectTicket(c.id);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-elevated)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{c.title}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>#{c.id.toString().slice(-6)}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Location: {c.location} | Dept: {c.category} | Status: <span style={{ fontWeight: '600' }}>{c.status}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

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

        {activeTab === 'notifications' && (
          <NotificationCenter complaints={complaints} />
        )}

        {activeTab === 'settings' && (
          <SettingsPage />
        )}

        {activeTab === 'profile' && (
          <ProfilePage user={user} setUser={setUser} />
        )}
      </main>
    </div>
  );
}
