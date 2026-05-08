import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './i18n/index.js';
import './index.css';
import App from './App.jsx';
import { DemoProvider } from './context/DemoContext.jsx';
import { AuthProvider } from './hooks/useAuth.js';

// Restore dark mode from localStorage
if (localStorage.getItem('darkMode') === 'true') {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DemoProvider>
          <App />
        </DemoProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
