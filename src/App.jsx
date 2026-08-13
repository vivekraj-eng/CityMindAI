import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Citizen from './pages/Citizen';
import Authority from './pages/Authority';
import { mockComplaints } from './data/mockData';
import './App.css';

function App() {
  const [view, setView] = useState('home');
  const [complaints, setComplaints] = useState(mockComplaints);

  const addComplaint = (newComplaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
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
          <Authority complaints={complaints} setComplaints={setComplaints} setView={setView} />
        )}
      </main>
    </div>
  );
}

export default App;
