import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Citizen from './pages/Citizen';
import Authority from './pages/Authority';
import { mockComplaints } from './data/mockData';
import { fetchComplaints, insertComplaint, updateComplaint } from './services/supabase';
import './App.css';

function App() {
  const [view, setView] = useState('home');
  const [complaints, setComplaints] = useState(mockComplaints);

  // Load complaints from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchComplaints();
      if (data !== null) {
        setComplaints(data);
      }
    };
    loadData();
  }, []);

  const addComplaint = async (newComplaint) => {
    // Optimistic local state update
    setComplaints((prev) => [newComplaint, ...prev]);
    // Save backend representation
    await insertComplaint(newComplaint);
  };

  const updateComplaintStatus = async (ticketId, nextStatus) => {
    // Optimistic local update
    setComplaints((prev) =>
      prev.map((c) => (c.id === ticketId ? { ...c, status: nextStatus } : c))
    );
    // Persist to Supabase
    await updateComplaint(ticketId, { status: nextStatus });
  };

  const updateComplaintCategory = async (ticketId, nextCategory) => {
    // Optimistic local update
    setComplaints((prev) =>
      prev.map((c) => (c.id === ticketId ? { ...c, category: nextCategory } : c))
    );
    // Persist to Supabase
    await updateComplaint(ticketId, { category: nextCategory });
  };

  return (
    <div className="app-wrapper">
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
