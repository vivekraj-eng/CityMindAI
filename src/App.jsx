import React, { useState, useEffect } from 'react';
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

  const addComplaint = async (newComplaint) => {
    setComplaints((prev) => {
      const updated = [newComplaint, ...prev];
      localStorage.setItem('citymind_complaints', JSON.stringify(updated));
      return updated;
    });
    await insertComplaint(newComplaint);
  };

  const updateComplaintStatus = async (ticketId, nextStatus) => {
    setComplaints((prev) => {
      const updated = prev.map((c) => 
        c.id === ticketId ? { ...c, status: nextStatus, updatedAt: new Date().toISOString() } : c
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
      <Navbar view={view} setView={setView} />
      <main className="main-content">
        {view === 'home' && <Home setView={setView} />}
        {view === 'citizen' && (
          <Citizen complaints={complaints} addComplaint={addComplaint} setView={setView} />
        )}
        {view === 'authority' && (
          <Authority 
            complaints={complaints} 
            updateComplaintStatus={updateComplaintStatus}
            updateComplaintCategory={updateComplaintCategory}
            setView={setView} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
