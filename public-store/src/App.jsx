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

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
        
        {/* Toast Notification Provider */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#1e293b',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '13px',
              padding: '12px 20px',
            },
            success: {
              iconTheme: {
                primary: '#4f46e5',
                secondary: '#ffffff',
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
