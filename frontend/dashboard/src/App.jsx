import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ReviewQueue from './pages/ReviewQueue';
import TransactionDetail from './pages/TransactionDetail';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import FloatingChat from './components/FloatingChat';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <>
      <Router>
        <div className={`flex min-h-screen ${darkMode ? 'bg-black' : 'bg-white'}`}>
          <Sidebar darkMode={darkMode} />
          <div className="flex-1 flex flex-col">
            <TopBar darkMode={darkMode} setDarkMode={setDarkMode} />
            <main className={`flex-1 overflow-auto p-6 ${darkMode ? 'bg-black' : 'bg-white'}`}>
              <Routes>
                <Route path="/" element={<Home darkMode={darkMode} />} />
                <Route path="/dashboard" element={<Dashboard darkMode={darkMode} />} />
                <Route path="/queue" element={<ReviewQueue darkMode={darkMode} />} />
                <Route path="/transaction/:id" element={<TransactionDetail darkMode={darkMode} />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
      <FloatingChat darkMode={darkMode} />
    </>
  );
}
