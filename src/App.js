import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HealthcareDashboard from './pages/HealthcareDashboard';
import CalendarPage from './pages/CalendarPage';
import NewAppointmentPage from './pages/NewAppointmentPage';

// Navigation Component
const Navigation = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-between items-center">
      <button
        onClick={() => navigate('/')}
        className="bg-white/90 hover:bg-white backdrop-blur-lg text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:border-gray-300 flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        ← Back to Landing
      </button>

      <div className="flex gap-2">
        <button
          onClick={() => navigate('/dashboard')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg ${window.location.pathname === '/dashboard'
            ? 'bg-blue-500 text-white shadow-blue-500/25'
            : 'bg-white/90 hover:bg-white backdrop-blur-lg text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
            }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate('/calendar')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg ${window.location.pathname === '/calendar'
            ? 'bg-blue-500 text-white shadow-blue-500/25'
            : 'bg-white/90 hover:bg-white backdrop-blur-lg text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
            }`}
        >
          Calendar
        </button>
      </div>
    </div>
  );
};

// Enhanced Landing Page Wrapper
const LandingPageWrapper = () => {
  const navigate = useNavigate();
  return <LandingPage onEnterDashboard={() => navigate('/dashboard')} />;
};

// Enhanced Dashboard Wrapper
const DashboardWrapper = () => {
  const navigate = useNavigate();
  return <HealthcareDashboard onNavigateToCalendar={() => navigate('/calendar')} />;
};

// Enhanced Calendar Wrapper
const CalendarWrapper = () => {
  const navigate = useNavigate();
  return <CalendarPage onNavigateToNewAppointment={() => navigate('/appointments/new')} />;
};

// Main App Component with Routing
const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPageWrapper />} />

          {/* Protected Routes with Navigation */}
          <Route path="/dashboard" element={
            <>
              <Navigation />
              <DashboardWrapper />
            </>
          } />

          <Route path="/calendar" element={
            <>
              <Navigation />
              <CalendarWrapper />
            </>
          } />

          <Route path="/appointments/new" element={
            <>
              <Navigation />
              <NewAppointmentPage />
            </>
          } />

          {/* Catch all route - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;