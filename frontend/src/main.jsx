import React from 'react';
import ReactDOM from 'react-dom/client'; // Correct import for React 18+
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // Make sure this is imported
import './index.css';

// 1. Get the root DOM element
const rootElement = document.getElementById('root');

// 2. Create a root
const root = ReactDOM.createRoot(rootElement);

// 3. Render the app inside the root
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
