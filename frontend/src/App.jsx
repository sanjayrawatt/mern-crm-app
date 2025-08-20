import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import CustomerList from './components/CustomerList';
import LeadList from './components/LeadList';
import OpportunityList from './components/OpportunityList';
import Login from './Login';
import Register from './components/Register';
// It's good practice to import a shared CSS file if you have one
import './App.css'; 

function App() {
  const { user, token, logout } = useContext(AuthContext);

  return (
    <Router>
      <div className="app-container">
        {token && (
          <nav className="main-nav">
            <div className="nav-welcome">Welcome, {user?.name || "User"}!</div>
            <div className="nav-links">
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/customers">Customers</Link>
              <Link to="/leads">Leads</Link>
              <Link to="/opportunities">Opportunities</Link>
            </div>
            <button onClick={logout} className="btn btn-secondary">Logout</button>
          </nav>
        )}
        <main className="main-content">
          <Routes>
            {token ? (
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/customers" element={<CustomerList />} />
                <Route path="/leads" element={<LeadList />} />
                <Route path="/opportunities" element={<OpportunityList />} />


                {/* This catch-all should be last */}
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </>
            ) : (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* This catch-all should be last */}
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
