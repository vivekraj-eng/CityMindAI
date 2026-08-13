import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Citizen from './pages/Citizen';
import Authority from './pages/Authority';
import InteractiveBackground from './components/InteractiveBackground';
import { mockComplaints } from './data/mockData';
import { fetchComplaints, insertComplaint, updateComplaint } from './services/supabase';
import './App.css';

function App() {
  const [view, setView] = useState('home');
  const [activeTab, setActiveTab] = useState('overview');
  const [complaints, setComplaints] = useState(mockComplaints);

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

  // Globally load Google Maps JavaScript API script
  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (key && !window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
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

  return (
    <div className="app-wrapper">
      <InteractiveBackground />
      <Navbar view={view} setView={setView} setAuthorityTab={setActiveTab} />
      <main className="main-content">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <Home setView={setView} />
            </motion.div>
          )}
          {view === 'citizen' && (
            <motion.div
              key="citizen"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <Citizen complaints={enrichedComplaints} addComplaint={addComplaint} setView={setView} />
            </motion.div>
          )}
          {view === 'authority' && (
            <motion.div
              key="authority"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <Authority 
                complaints={enrichedComplaints} 
                updateComplaintStatus={updateComplaintStatus}
                updateComplaintCategory={updateComplaintCategory}
                setView={setView} 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
