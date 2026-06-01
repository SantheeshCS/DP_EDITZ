import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Shared Page Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Client Screens
import Home from './pages/Home';
import Browse from './pages/Browse';
import TemplateDetail from './pages/TemplateDetail';
import Download from './pages/Download';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-purple-600 selection:text-white">
        
        {/* Toast Notification Provider */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#0b0f19',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px',
              fontSize: '13px',
              padding: '12px 20px',
            },
            success: {
              iconTheme: {
                primary: '#a855f7',
                secondary: '#f8fafc',
              },
            },
          }}
        />

        {/* Global Navigation Header */}
        <Navbar />

        {/* Dynamic Route Pages Container */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/templates/:id" element={<TemplateDetail />} />
            <Route path="/download/:orderId" element={<Download />} />

            {/* Fallbacks */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
