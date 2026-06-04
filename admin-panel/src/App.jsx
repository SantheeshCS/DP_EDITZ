import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Routing Guard & Shell Layout
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Administrative Screens
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TemplatesList from './pages/TemplatesList';
import TemplateNew from './pages/TemplateNew';
import TemplateEdit from './pages/TemplateEdit';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
          },
          success: {
            iconTheme: {
              primary: '#6366f1',
              secondary: '#f8fafc',
            },
          },
        }}
      />
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Private Dashboard and Inventory Routes (Auth Guarded) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <Layout>
                <TemplatesList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/templates/new"
          element={
            <ProtectedRoute>
              <Layout>
                <TemplateNew />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/templates/:id/edit"
          element={
            <ProtectedRoute>
              <Layout>
                <TemplateEdit />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* Base Fallbacks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
