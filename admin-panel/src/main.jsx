import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Intercept browser refresh and force redirect
if (window.performance) {
  const navEntries = window.performance.getEntriesByType('navigation');
  const isReload = (navEntries.length > 0 && navEntries[0].type === 'reload') || 
                   (window.performance.navigation && window.performance.navigation.type === 1);
  
  if (isReload && window.location.pathname !== '/dashboard' && window.location.pathname !== '/login') {
    window.location.replace('/dashboard');
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
