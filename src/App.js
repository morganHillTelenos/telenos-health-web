import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import HealthcareDashboard from './pages/HealthcareDashboard';
import CalendarPage from './pages/CalendarPage';
import NewAppointmentPage from './pages/NewAppointmentPage';
import PatientsPage from './pages/PatientsPage';
import PsychiatristApplicationPage from './pages/PsychiatristApplicationPage';
import { authService } from './services/auth';
import TestAmplifyGen2 from './TestAmplifyGen2';
import NewPatientForm from './pages/NewPatientForm';
import { apiService } from './services/api'; // Add this import at the top
import PatientDetailPage from './pages/PatientDetailPage';


// Replace the existing NewPatientPage component with this:
const NewPatientPage = () => {
  const navigate = useNavigate();

  const handleSave = async (patientData) => {
    try {
      console.log('Patient saved successfully:', patientData);
      // Navigate back to patients list to see the new patient
      navigate('/patients');
    } catch (error) {
      console.error('Error in handleSave:', error);
      // Let the form handle the error display
    }
  };

  const handleClose = () => {
    navigate('/patients');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8 pt-20">
        <NewPatientForm
          onSave={handleSave}
          onClose={handleClose}
          showCloseButton={true}
        />
      </div>
    </div>
  );
};

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
          onClick={() => navigate('/patients')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg ${window.location.pathname === '/patients'
            ? 'bg-blue-500 text-white shadow-blue-500/25'
            : 'bg-white/90 hover:bg-white backdrop-blur-lg text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
            }`}
        >
          Patients
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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // User will remain null, redirecting to login
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Enhanced Landing Page Wrapper
const LandingPageWrapper = () => {
  const navigate = useNavigate();
  return <LandingPage onEnterDashboard={() => navigate('/dashboard')} />;
};

// Enhanced Login Page Wrapper
const LoginPageWrapper = () => {
  const navigate = useNavigate();

  const handleLogin = (user) => {
    console.log('User logged in:', user);
    // Navigate to dashboard after successful login
    navigate('/dashboard');
  };

  return <LoginPage onLogin={handleLogin} />;
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

// Enhanced Patients Wrapper
const PatientsWrapper = () => {
  const navigate = useNavigate();
  return (
    <PatientsPage
      onNavigateToPatient={(patientId) => navigate(`/patients/${patientId}`)}
      onNavigateToNewPatient={() => navigate('/patients/new')}
    />
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPageWrapper />} />
          <Route path="/login" element={<LoginPageWrapper />} />

          {/* Psychiatrist Application Route (Public) */}
          <Route path="/apply-psychiatrist" element={<PsychiatristApplicationPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Navigation />
              <DashboardWrapper />
            </ProtectedRoute>
          } />

          <Route path="/calendar" element={
            <ProtectedRoute>
              <Navigation />
              <CalendarWrapper />
            </ProtectedRoute>
          } />

          <Route path="/appointments/new" element={
            <ProtectedRoute>
              <Navigation />
              <NewAppointmentPage />
            </ProtectedRoute>
          } />

          <Route path="/patients" element={
            <ProtectedRoute>
              <Navigation />
              <PatientsWrapper />
            </ProtectedRoute>
          } />

          <Route path="/patients/new" element={
            <ProtectedRoute>
              <Navigation />
              <NewPatientPage />
            </ProtectedRoute>
          } />

          <Route path="/patients/:id" element={
            <ProtectedRoute>
              <Navigation />
              <PatientDetailPage />
            </ProtectedRoute>
          } />

          {/* Catch all route - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />

          <Route path="/test-amplify" element={<TestAmplifyGen2 />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;