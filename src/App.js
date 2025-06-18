// src/App.js - Updated with login flow
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/auth';

// Import your pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import NewPatientPage from './pages/NewPatientPage';
import CalendarPage from './pages/CalendarPage';
import VideoCallPage from './pages/VideoCallPage';

// Import components
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';

// Import styles
import './styles/globals.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing authentication on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      if (authService.isAuthenticated()) {
        try {
          // Verify token is still valid by getting current user
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          console.log('User authenticated:', currentUser);
        } catch (error) {
          console.warn('Token validation failed:', error);
          // Clear invalid authentication
          await authService.signOut();
          setUser(null);
        }
      } else {
        console.log('No authentication found');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setError(error.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    console.log('Login successful, setting user:', userData);
    setUser(userData);
    setError(null);
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
      // Clear user anyway
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="app-loading">
        <LoadingSpinner />
        <p>Loading TelenosHealth...</p>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="app-error">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {user && (
          <Header
            user={user}
            onLogout={handleLogout}
          />
        )}

        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                user ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <LandingPage />
                )
              }
            />

            <Route
              path="/login"
              element={
                user ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              }
            />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                user ? (
                  <DashboardPage user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/patients"
              element={
                user ? (
                  <PatientsPage user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/patients/new"
              element={
                user ? (
                  <NewPatientPage user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/calendar"
              element={
                user ? (
                  <CalendarPage user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/video-call/:appointmentId"
              element={
                user ? (
                  <VideoCallPage user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Catch all route */}
            <Route
              path="*"
              element={
                <div className="not-found">
                  <h2>Page Not Found</h2>
                  <p>The page you're looking for doesn't exist.</p>
                  {user ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/" replace />
                  )}
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;