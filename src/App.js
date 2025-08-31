// src/App.js - Fixed without nested Router
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';
import './styles/globals.css';

// Proper ES6 imports
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import HealthcareDashboard from './pages/HealthcareDashboard';
import PatientsPage from './pages/PatientsPage';
import NewPatientForm from './pages/NewPatientForm';
import CalendarPage from './pages/CalendarPage';
import VideoCallPage from './pages/VideoCallPage';
import Header from './components/Header';
import NewAppointmentPage from './pages/NewAppointmentPage';
import NotesPage from './pages/NotesPage';
import LandingPagePatients from './pages/LandingPagePatients';

const ComingSoonPage = () => (
  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }}>
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Coming Soon</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>This feature is under development</p>
      <button
        onClick={() => window.history.back()}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: '2px solid rgba(255,255,255,0.3)',
          color: 'white',
          padding: '1rem 2rem',
          fontSize: '1.1rem',
          borderRadius: '50px',
          cursor: 'pointer'
        }}
      >
        Go Back
      </button>
    </div>
  </div>
);

// Simple Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main App Component
function App({ signOut, user }) {
  // Helper function to create user object from Cognito user
  const getCognitoUser = () => {
    if (!user) return null;

    return {
      username: user.username,
      email: user.signInDetails?.loginId || user.attributes?.email || user.username,
      userId: user.userId,
      name: user.attributes?.email || user.username,
      role: 'Healthcare Provider'
    };
  };

  // Common logout handler
  const handleLogout = () => {
    if (signOut) {
      signOut();
    }
  };

  // Component Wrappers
  const LandingPageWrapper = () => {
    return <LandingPage />;
  };

  const LandingPagePatientsWrapper = () => {
    return <LandingPagePatients />;
  };

  const ComingSoonPageWrapper = () => {
    return <ComingSoonPage />;
  };

  const LoginPageWrapper = () => {
    const currentUser = getCognitoUser();

    if (currentUser) {
      return <Navigate to="/dashboard" replace />;
    }

    return <LoginPage />;
  };

  const DashboardWrapper = () => {
    const currentUser = getCognitoUser();

    return (
      <div>
        <Header user={currentUser} onLogout={handleLogout} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container mx-auto px-6 py-8 pt-20">
            <HealthcareDashboard user={currentUser} />
          </div>
        </div>
      </div>
    );
  };

  const PatientsWrapper = () => {
    const currentUser = getCognitoUser();

    return (
      <div>
        <Header user={currentUser} onLogout={handleLogout} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container mx-auto px-6 py-8 pt-20">
            <PatientsPage user={currentUser} />
          </div>
        </div>
      </div>
    );
  };

  const NewPatientWrapper = () => {
    const currentUser = getCognitoUser();

    return (
      <div>
        <Header user={currentUser} onLogout={handleLogout} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container mx-auto px-6 py-8 pt-20">
            <NewPatientForm user={currentUser} />
          </div>
        </div>
      </div>
    );
  };

  const CalendarWrapper = () => {
    const currentUser = getCognitoUser();

    return (
      <div>
        <Header user={currentUser} onLogout={handleLogout} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container mx-auto px-6 py-8 pt-20">
            <CalendarPage user={currentUser} />
          </div>
        </div>
      </div>
    );
  };

  const NewAppointmentWrapper = () => {
    const currentUser = getCognitoUser();

    return (
      <div>
        <Header user={currentUser} onLogout={handleLogout} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container mx-auto px-6 py-8 pt-20">
            <NewAppointmentPage user={currentUser} />
          </div>
        </div>
      </div>
    );
  };

  const NotesWrapper = () => {
    const currentUser = getCognitoUser();

    return (
      <div>
        <Header user={currentUser} onLogout={handleLogout} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container mx-auto px-6 py-8 pt-20">
            <NotesPage user={currentUser} />
          </div>
        </div>
      </div>
    );
  };

  const VideoCallWrapper = () => {
    const location = useLocation();
    const { appointmentId } = useParams();
    const isProviderStart = location.pathname.includes('/start/');

    console.log('Provider video call page loaded');
    console.log('- URL:', location.pathname);
    console.log('- Provider start:', isProviderStart);

    return <VideoCallPage />;
  };

  const PatientVideoCallWrapper = () => {
    const location = useLocation();
    const { appointmentId, patientToken } = useParams();

    console.log('Patient video call page loaded');
    console.log('- URL:', location.pathname);
    console.log('- Appointment ID:', appointmentId);
    console.log('- Patient Token:', patientToken);

    return <VideoCallPage isPatient={true} />;
  };

  // Log current user for debugging
  useEffect(() => {
    if (user) {
      console.log('Cognito user authenticated:', {
        username: user.username,
        email: user.attributes?.email || user.signInDetails?.loginId,
        userId: user.userId
      });
    }
  }, [user]);

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPageWrapper />} />
        <Route path="/home" element={<LandingPagePatientsWrapper />} />
        <Route path="/coming-soon" element={<ComingSoonPageWrapper />} />
        <Route path="/login" element={<LoginPageWrapper />} />

        {/* Protected Routes - All require Cognito authentication */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardWrapper /></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute><PatientsWrapper /></ProtectedRoute>} />
        <Route path="/patients/new" element={<ProtectedRoute><NewPatientWrapper /></ProtectedRoute>} />
        <Route path="/appointments/new" element={<ProtectedRoute><NewAppointmentWrapper /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><CalendarWrapper /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><NotesWrapper /></ProtectedRoute>} />

        {/* Video Call Routes */}
        <Route path="/video-call/start/:appointmentId" element={<ProtectedRoute><VideoCallWrapper /></ProtectedRoute>} />
        <Route path="/video-call/:appointmentId" element={<ProtectedRoute><VideoCallWrapper /></ProtectedRoute>} />

        {/* Patient Video Call Routes - NO AUTHENTICATION REQUIRED */}
        <Route path="/join/:appointmentId" element={<PatientVideoCallWrapper />} />
        <Route path="/join/:appointmentId/:patientToken" element={<PatientVideoCallWrapper />} />

        {/* Catch all - redirect to home for non-authenticated users */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;