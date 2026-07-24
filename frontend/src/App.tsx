import React from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import { Activity, LogOut, LayoutDashboard, UserPlus, LogIn } from 'lucide-react';

function Navigation() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="site-header">
      <div className="nav-container">
        <Link to="/" className="logo-brand">
          <div className="logo-icon">
            <Activity size={22} />
          </div>
          <span>Page Pulse</span>
        </Link>

        <nav className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Audit Tool
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                <LayoutDashboard size={16} style={{ display: 'inline', marginRight: '4px' }} /> Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.4rem 0.85rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                <LogIn size={16} style={{ display: 'inline', marginRight: '4px' }} /> Login
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: '0.45rem 1rem' }}>
                <UserPlus size={16} /> Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app-wrapper">
        <Navigation />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {/* Mandatory Footer component mounted once outside Routes switch */}
        <Footer />
      </div>
    </AuthProvider>
  );
}
