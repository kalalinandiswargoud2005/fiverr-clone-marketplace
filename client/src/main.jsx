// client/src/main.jsx (for Vite users) or client/src/index.js (for Create React App users)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext'; // Import your AuthProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* Wrap your App component with AuthProvider */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
);