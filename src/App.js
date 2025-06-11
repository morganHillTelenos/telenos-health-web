// App.js - Main application component
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/globals.css';

// Import pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import NewPatientPage from './pages/NewPatientPage';
import CalendarPage from './pages/CalendarPage';
import AppointmentPage from './pages/AppointmentPage';
import VideoCallPage from './pages/VideoCallPage';

// Import components
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';

// Import services
import { authService } from './services/auth';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.log('No user logged in');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="app">
        <Header user={user} onLogout={handleLogout} />

        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={
              user ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />
            } />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              user ? <DashboardPage /> : <Navigate to="/login" />
            } />
            <Route path="/patients" element={
              user ? <PatientsPage /> : <Navigate to="/login" />
            } />
            <Route path="/patients/new" element={
              user ? <NewPatientPage /> : <Navigate to="/login" />
            } />
            <Route path="/calendar" element={
              user ? <CalendarPage /> : <Navigate to="/login" />
            } />
            <Route path="/appointment/:id" element={
              user ? <AppointmentPage /> : <Navigate to="/login" />
            } />
            <Route path="/video-call/:appointmentId" element={
              user ? <VideoCallPage /> : <Navigate to="/login" />
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
