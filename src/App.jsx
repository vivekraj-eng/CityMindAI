import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Citizen from './pages/Citizen';
import Authority from './pages/Authority';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MapView from './components/MapView';
import Analytics from './components/Analytics';
import InteractiveBackground from './components/InteractiveBackground';
import { mockComplaints } from './data/mockData';
import { fetchComplaints, insertComplaint, updateComplaint } from './services/supabase';
import './App.css';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [activeTab, setActiveTab] = useState('overview');
  const [citizenTab, setCitizenTab] = useState('my-reports');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('citymind_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });
  const [complaints, setComplaints] = useState(mockComplaints);

  // Monitor popstate for browser back/forward buttons
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Intercept standard local links for true client-side routing
  useEffect(() => {
    const handleLinkClick = (e) => {
      const link = e.target.closest('a');
      if (link && link.getAttribute('href')?.startsWith('/') && !link.getAttribute('target')) {
        e.preventDefault();
        const href = link.getAttribute('href');
        window.history.pushState({}, '', href);
        setCurrentPath(href);
      }
    };
    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  // Custom navigate function for backward compatibility with component triggers
  const customNavigate = (path) => {
    let targetPath = path;
    if (path === 'home') targetPath = '/';
    else if (path === 'citizen') targetPath = '/reports';
    else if (path === 'authority') targetPath = '/workspace';
    else if (path === 'login') targetPath = '/login';
    else if (path === 'register') targetPath = '/register';

    window.history.pushState({}, '', targetPath);
    setCurrentPath(targetPath);
  };

  // Load complaints from Supabase with localStorage backup on mount
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchComplaints();
      if (data !== null) {
        setComplaints(data);
        localStorage.setItem('citymind_complaints', JSON.stringify(data));
      } else {
        const localData = localStorage.getItem('citymind_complaints');
        if (localData) {
          try {
            setComplaints(JSON.parse(localData));
          } catch (e) {
            console.error("Failed to parse localStorage complaints:", e);
          }
        }
      }
    };
    loadData();
  }, []);


  const enrichComplaints = (rawList) => {
    return rawList.map((c) => {
      // 1. Calculate SLA timer: Reported -> Assigned -> Resolution
      const createdTime = new Date(c.createdAt || c.created_at || Date.now());
      const now = new Date();
      const elapsedMs = now - createdTime;
      const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
      const elapsedMinutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
      
      let timeElapsedStr = elapsedHours > 0 ? `${elapsedHours}h ${elapsedMinutes}m` : `${elapsedMinutes}m`;
      if (elapsedHours > 24) {
        timeElapsedStr = `${Math.floor(elapsedHours / 24)}d ago`;
      }
      
      // SLA Warning flag: if status is 'Submitted' and ticket is older than 4 hours -> SLA approaching delay!
      const isSlaDelayed = ['submitted', 'ai analyzed'].includes(c.status?.toLowerCase()) && elapsedHours >= 4;

      // 2. Duplicate Check: Scan other complaints to check similarity
      const possibleDuplicateOf = rawList.find((other) => {
        if (other.id === c.id) return false;
        const sameLocation = other.location?.toLowerCase().trim() === c.location?.toLowerCase().trim();
        const descWordsOther = other.description?.toLowerCase().split(/\s+/) || [];
        const descWordsSelf = c.description?.toLowerCase().split(/\s+/) || [];
        const commonWords = descWordsSelf.filter(w => w.length > 3 && descWordsOther.includes(w));
        const similarity = commonWords.length / Math.max(1, descWordsSelf.length);
        
        return (sameLocation && similarity > 0.4) || 
               (other.title?.toLowerCase().trim() === c.title?.toLowerCase().trim() && sameLocation);
      });

      // 3. Location Clustering
      const clusterCount = rawList.filter(
        (other) => other.location?.toLowerCase().trim() === c.location?.toLowerCase().trim()
      ).length;

      return {
        ...c,
        timeElapsedStr,
        isSlaDelayed,
        duplicateOfId: possibleDuplicateOf ? possibleDuplicateOf.id : null,
        duplicateOfTitle: possibleDuplicateOf ? possibleDuplicateOf.title : null,
        clusterCount
      };
    });
  };

  const enrichedComplaints = enrichComplaints(complaints);

  const addComplaint = async (newComplaint) => {
    setComplaints((prev) => {
      const updated = [newComplaint, ...prev];
      localStorage.setItem('citymind_complaints', JSON.stringify(updated));
      return updated;
    });
    await insertComplaint(newComplaint);
  };

  const updateComplaintStatus = async (ticketId, nextStatus, resolutionMeta = null) => {
    setComplaints((prev) => {
      const updated = prev.map((c) => 
        c.id === ticketId 
          ? { 
              ...c, 
              status: nextStatus, 
              updatedAt: new Date().toISOString(),
              resolutionNote: resolutionMeta?.resolutionNote || c.resolutionNote,
              resolutionDate: resolutionMeta?.resolutionDate || (nextStatus === 'Resolved' ? new Date().toISOString() : c.resolutionDate)
            } 
          : c
      );
      localStorage.setItem('citymind_complaints', JSON.stringify(updated));
      return updated;
    });
    await updateComplaint(ticketId, { status: nextStatus });
  };

  const updateComplaintCategory = async (ticketId, nextCategory) => {
    setComplaints((prev) => {
      const updated = prev.map((c) => 
        c.id === ticketId ? { ...c, category: nextCategory, updatedAt: new Date().toISOString() } : c
      );
      localStorage.setItem('citymind_complaints', JSON.stringify(updated));
      return updated;
    });
    await updateComplaint(ticketId, { category: nextCategory });
  };

  // Main Route Switch Router View Renderer
  const renderRouteContent = () => {
    const isAuthRoute = currentPath.startsWith('/workspace') || ['/reports', '/map', '/analytics', '/profile'].includes(currentPath);
    if (isAuthRoute && !user) {
      return <LoginPage setView={customNavigate} setUser={setUser} setCitizenTab={setCitizenTab} />;
    }

    if (currentPath === '/' || currentPath === '/index.html') {
      return <Home setView={customNavigate} />;
    }
    if (currentPath === '/login') {
      return <LoginPage setView={customNavigate} setUser={setUser} setCitizenTab={setCitizenTab} />;
    }
    if (currentPath === '/register') {
      return <RegisterPage setView={customNavigate} setUser={setUser} setCitizenTab={setCitizenTab} />;
    }

    if (currentPath === '/reports') {
      return (
        <Citizen 
          complaints={enrichedComplaints} 
          addComplaint={addComplaint} 
          setView={customNavigate} 
          activeTab={citizenTab} 
          setActiveTab={(tab) => {
            setCitizenTab(tab);
            if (tab === 'profile') customNavigate('/profile');
          }} 
          user={user} 
          setUser={setUser} 
        />
      );
    }

    if (currentPath === '/map') {
      return (
        <div style={{ background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '24px', minHeight: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 0 }}>CityMind Live Civic Map</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Real-time location clusters and geocoded municipality indicators.</p>
            </div>
            <button className="back-to-home" onClick={() => customNavigate('/')}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Back</span>
            </button>
          </div>
          <div style={{ flex: 1, minHeight: '480px', position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
            <MapView complaints={enrichedComplaints} onSelectTicket={(id) => customNavigate('/workspace/complaints')} />
          </div>
        </div>
      );
    }

    if (currentPath === '/analytics') {
      return (
        <div style={{ background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '24px', marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 0 }}>Municipal Performance Analytics</h2>
            <button className="back-to-home" onClick={() => customNavigate('/')}>
              <span>Back</span>
            </button>
          </div>
          <Analytics complaints={enrichedComplaints} />
        </div>
      );
    }

    if (currentPath === '/profile') {
      if (user?.role === 'Authority') {
        return (
          <Authority 
            complaints={enrichedComplaints} 
            updateComplaintStatus={updateComplaintStatus}
            updateComplaintCategory={updateComplaintCategory}
            setView={customNavigate} 
            activeTab="profile"
            setActiveTab={(tab) => {
              if (tab === 'overview') customNavigate('/workspace');
              else customNavigate(`/workspace/${tab}`);
            }}
            user={user}
            setUser={setUser}
          />
        );
      } else {
        return (
          <Citizen 
            complaints={enrichedComplaints} 
            addComplaint={addComplaint} 
            setView={customNavigate} 
            activeTab="profile" 
            setActiveTab={(tab) => {
              setCitizenTab(tab);
              if (tab === 'my-reports') customNavigate('/reports');
            }} 
            user={user} 
            setUser={setUser} 
          />
        );
      }
    }

    if (currentPath.startsWith('/workspace')) {
      let tab = 'overview';
      if (currentPath === '/workspace/complaints') tab = 'complaints';
      else if (currentPath === '/workspace/map') tab = 'map';
      else if (currentPath === '/workspace/departments') tab = 'departments';
      else if (currentPath === '/workspace/copilot') tab = 'copilot';
      else if (currentPath === '/workspace/analytics') tab = 'analytics';
      else if (currentPath === '/workspace/resolved') tab = 'resolved';
      else if (currentPath === '/workspace/settings') tab = 'settings';

      return (
        <Authority 
          complaints={enrichedComplaints} 
          updateComplaintStatus={updateComplaintStatus}
          updateComplaintCategory={updateComplaintCategory}
          setView={customNavigate} 
          activeTab={tab}
          setActiveTab={(nextTab) => {
            setActiveTab(nextTab);
            if (nextTab === 'overview') customNavigate('/workspace');
            else customNavigate(`/workspace/${nextTab}`);
          }}
          user={user}
          setUser={setUser}
        />
      );
    }

    // Default Fallback
    return <Home setView={customNavigate} />;
  };

  // Convert current path back into compatible view state string for navbar active highlights
  const viewString = currentPath === '/' ? 'home' : (currentPath === '/reports' ? 'citizen' : 'authority');

  return (
    <div className="app-wrapper">
      <InteractiveBackground />
      <Navbar 
        view={viewString} 
        setView={customNavigate} 
        user={user} 
        setUser={setUser} 
        activeTab={currentPath.startsWith('/workspace/') ? currentPath.split('/')[2] : 'overview'}
        citizenTab={citizenTab}
        setAuthorityTab={setActiveTab} 
        setCitizenTab={setCitizenTab} 
      />
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderRouteContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
