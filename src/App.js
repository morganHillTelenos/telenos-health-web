// src/App.js - Updated to work with conditional authentication
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';
import './styles/globals.css';

// Import your existing components
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
import LandingPatient from './pages/LandingPagePatients'; 

// Import services - fallback only
import { authService } from './services/auth';

// Enhanced Protected Route Component
const ProtectedRoute = ({ children }) => {
  // Since we're using Authenticator, user is always authenticated when this renders
  return children;
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
  </div>
);

// Main App Component - Updated to handle Cognito props
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
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Wrapper Components
  const LoginPageWrapper = () => {
    const navigate = useNavigate();
    return <Navigate to="/dashboard" replace />; // Always redirect to dashboard since user is authenticated
  };

  // Add LandingPage wrapper for root route
  const LandingPageWrapper = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
      navigate('/dashboard');
    };

    const handleLogin = () => {
      navigate('/dashboard'); // Since user is already authenticated
    };

    return (
      <LandingPage
        onGetStarted={handleGetStarted}
        onLogin={handleLogin}
      />
    );
  };

  // Add LandingPage wrapper for root route
  const LandingPagePatientWrapper = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
      navigate('/dashboard');
    };

    const handleLogin = () => {
      navigate('/dashboard'); // Since user is already authenticated
    };

    return (
      <LandingPatient
        onGetStarted={handleGetStarted}
        onLogin={handleLogin}
      />
    );
  };

  const DashboardWrapper = () => {
    const navigate = useNavigate();
    const currentUser = getCognitoUser();

    const handleVideoCallStart = async (appointmentId) => {
      try {
        const id = appointmentId || `appointment-${Date.now()}`;
        console.log('🎥 Starting video call for appointment:', id);
        navigate(`/video-call/start/${id}`);
      } catch (error) {
        console.error('❌ Video call start error:', error);
      }
    };

    const handleNavigateToPatients = () => navigate('/patients');
    const handleNavigateToCalendar = () => navigate('/calendar');
    const handleNavigateToNotes = () => navigate('/notes');

    return (
      <div>
        <Header user={currentUser} onLogout={handleLogout} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container mx-auto px-6 py-8 pt-20">
            <HealthcareDashboard
              user={currentUser}
              onVideoCallStart={handleVideoCallStart}
              onNavigateToPatients={handleNavigateToPatients}
              onNavigateToCalendar={handleNavigateToCalendar}
              onNavigateToNotes={handleNavigateToNotes}
            />
          </div>
        </div>
      </div>
    );
  };

  const PatientsWrapper = () => {
    const navigate = useNavigate();
    const currentUser = getCognitoUser();

    const handleAddPatient = () => navigate('/patients/new');

    return (
      <div>
        <Header user={currentUser} onLogout={handleLogout} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container mx-auto px-6 py-8 pt-20">
            <PatientsPage user={currentUser} onAddPatient={handleAddPatient} />
          </div>
        </div>
      </div>
    );
  };

  const NewPatientWrapper = () => {
    const navigate = useNavigate();
    const currentUser = getCognitoUser();

    const handleSuccess = () => navigate('/patients');
    const handleCancel = () => navigate('/patients');

    return (
      <div>
        <Header user={currentUser} onLogout={handleLogout} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container mx-auto px-6 py-8 pt-20">
            <NewPatientForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </div>
        </div>
      </div>
    );
  };

  const NewAppointmentWrapper = () => {
    const navigate = useNavigate();
    const currentUser = getCognitoUser();

    const handleSuccess = () => navigate('/calendar');
    const handleCancel = () => navigate('/calendar');

    return (
      <div>
        <Header user={currentUser} onLogout={handleLogout} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container mx-auto px-6 py-8 pt-20">
            <NewAppointmentPage onSuccess={handleSuccess} onCancel={handleCancel} />
          </div>
        </div>
      </div>
    );
  };

  const CalendarWrapper = () => {
    const navigate = useNavigate();
    const currentUser = getCognitoUser();

    const handleNewAppointment = () => {
      navigate('/appointments/new');
    };

    // ✅ ADD THESE VIDEO CALL HANDLERS
    const handleJoinVideoCall = (appointmentId) => {
      console.log('🎥 Joining video call for appointment:', appointmentId);
      navigate(`/video-call/${appointmentId}`);
    };

    const handleStartVideoCall = (appointmentId) => {
      console.log('🎥 Starting video call for appointment:', appointmentId);
      navigate(`/video-call/start/${appointmentId}`);
    };

    return (
      <div>
        <Header user={currentUser} onLogout={handleLogout} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container mx-auto px-6 py-8 pt-20">
            <CalendarPage
              user={currentUser}
              onNewAppointment={handleNewAppointment}
              onJoinVideoCall={handleJoinVideoCall}        // ✅ Add this
              onStartVideoCall={handleStartVideoCall}      // ✅ Add this
            />
          </div>
        </div>
      </div>
    );
  };

  const DoctorsWrapper = () => {
    const currentUser = getCognitoUser();

    return (
      <div>
        <Header user={currentUser} onLogout={handleLogout} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container mx-auto px-6 py-8 pt-20">
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

  const DoctorTestWrapper = () => {
    const currentUser = getCognitoUser();

    return (
      <div>
        <Header user={currentUser} onLogout={handleLogout} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container mx-auto px-6 py-8 pt-20">
          </div>
        </div>
      </div>
    );
  };

  // ✅ ADD THIS VideoCallWrapper COMPONENT TO YOUR APP.JS

  const VideoCallWrapper = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const currentUser = getCognitoUser();
    const location = useLocation();

    // Check if this is a provider starting a call vs joining
    const isStartCall = location.pathname.includes('/start/');
    const isPatient = currentUser?.role?.toLowerCase().includes('patient');

    return (
      <div>
        <Header user={currentUser} onLogout={handleLogout} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <VideoCallPage
            appointmentId={appointmentId}
            isPatient={isPatient}
            isStartCall={isStartCall}
          />
        </div>
      </div>
    );
  };

  // ✅ AND ADD THESE ROUTES TO YOUR ROUTES SECTION:

  const PatientVideoCallWrapper = () => {
    const location = useLocation();
    const { appointmentId, patientToken } = useParams();

    console.log('👤 Patient video call page loaded');
    console.log('- URL:', location.pathname);
    console.log('- Appointment ID:', appointmentId);
    console.log('- Patient Token:', patientToken);

    return <VideoCallPage isPatient={true} />;
  };

  const DebugWrapper = () => {
    const currentUser = getCognitoUser();

    return (
      <div>
        <Header user={currentUser} onLogout={handleLogout} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container mx-auto px-6 py-8 pt-20">
          </div>
        </div>
      </div>
    );
  };

  // Log current user for debugging
  useEffect(() => {
    if (user) {
      console.log('✅ Cognito user authenticated:', {
        username: user.username,
        email: user.attributes?.email || user.signInDetails?.loginId,
        userId: user.userId
      });
    }
  }, [user]);

  return (
    <div className="App">
      <Routes>
        {/* Root route - Landing Page */}
        <Route path="/" element={<LandingPageWrapper />} />
        <Route path="/home" element={<LandingPagePatientWrapper />} />

        {/* Login redirects to dashboard since user is already authenticated */}
        <Route path="/login" element={<LoginPageWrapper />} />

        {/* Protected Routes - All require Cognito authentication */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardWrapper /></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute><PatientsWrapper /></ProtectedRoute>} />
        <Route path="/patients/new" element={<ProtectedRoute><NewPatientWrapper /></ProtectedRoute>} />
        <Route path="/appointments/new" element={<ProtectedRoute><NewAppointmentWrapper /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><CalendarWrapper /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><NotesWrapper /></ProtectedRoute>} />
        <Route path="/doctors" element={<ProtectedRoute><DoctorsWrapper /></ProtectedRoute>} />
        <Route path="/test-doctors" element={<ProtectedRoute><DoctorTestWrapper /></ProtectedRoute>} />

        {/* Video Call Routes */}
        <Route path="/video-call/start/:appointmentId" element={<ProtectedRoute><VideoCallWrapper /></ProtectedRoute>} />
        <Route path="/video-call/:appointmentId" element={<ProtectedRoute><VideoCallWrapper /></ProtectedRoute>} />

        {/* Patient Video Call Routes - NO AUTHENTICATION REQUIRED */}
        <Route path="/join/:appointmentId" element={<PatientVideoCallWrapper />} />
        <Route path="/join/:appointmentId/:patientToken" element={<PatientVideoCallWrapper />} />

        {/* Debug route */}
        <Route path="/debug" element={<ProtectedRoute><DebugWrapper /></ProtectedRoute>} />

        {/* Catch all for unknown routes - redirect to root instead of dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;