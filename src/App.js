// App.js - Updated with Video Call Integration
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import HealthcareDashboard from './pages/HealthcareDashboard';
import CalendarPage from './pages/CalendarPage';
import NewAppointmentPage from './pages/NewAppointmentPage';
import PatientsPage from './pages/PatientsPage';
import PsychiatristApplicationPage from './pages/PsychiatristApplicationPage';
import VideoCallPage from './pages/VideoCallPage';
import { authService } from './services/auth';

// Navigation Component with Video Call support
const Navigation = () => {
  const navigate = useNavigate();
  const location = window.location.pathname;

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
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg ${location === '/dashboard'
              ? 'bg-blue-500 text-white shadow-blue-500/25'
              : 'bg-white/90 hover:bg-white backdrop-blur-lg text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
            }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate('/patients')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg ${location === '/patients'
              ? 'bg-blue-500 text-white shadow-blue-500/25'
              : 'bg-white/90 hover:bg-white backdrop-blur-lg text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
            }`}
        >
          Patients
        </button>
        <button
          onClick={() => navigate('/calendar')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg ${location === '/calendar'
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

const PatientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const startVideoCall = async () => {
    try {
      // Create appointment ID specific to this patient
      const appointmentId = `patient-${id}-${Date.now()}`;

      // Navigate to video call page
      navigate(`/video-call/${appointmentId}`);

    } catch (error) {
      console.error('Error starting video call:', error);
      alert('Failed to start video call: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8 pt-20">
        <div className="mb-8">
          <button
            onClick={() => navigate('/patients')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
          >
            <span className="text-lg">←</span>
            Back to Patients
          </button>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-8 shadow-lg">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Patient Details</h1>
            <p className="text-gray-600 mb-6">Patient ID: {id}</p>

            {/* Video Call Button */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={startVideoCall}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                🎥 Start Video Call
              </button>
              <button
                onClick={() => navigate(`/appointments/new?patientId=${id}`)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                📅 Schedule Appointment
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">🎥 Frontend-Only Video Calling</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✅ No separate backend server needed</li>
                <li>✅ Direct AWS Chime SDK integration</li>
                <li>✅ Real HD video calls with your AWS account</li>
                <li>✅ HIPAA compliant infrastructure</li>
                <li>✅ Patient sharing links generated automatically</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced New Patient Page
const NewPatientPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8 pt-20">
        <div className="mb-8">
          <button
            onClick={() => navigate('/patients')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
          >
            <span className="text-lg">←</span>
            Back to Patients
          </button>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-8 shadow-lg">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Add New Patient</h1>
            <p className="text-gray-600 mb-6">Create a new patient record in your system.</p>
            <p className="text-sm text-gray-500">
              This is a placeholder page. You can create a full patient form here or use your existing NewPatientPage component.
            </p>
          </div>
        </div>
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
    navigate('/dashboard');
  };

  return <LoginPage onLogin={handleLogin} />;
};

// Enhanced Dashboard Wrapper with Video Call support
const DashboardWrapper = () => {
  const navigate = useNavigate();

  const handleVideoCallStart = async () => {
    try {
      // Create a unique appointment ID
      const appointmentId = `appointment-${Date.now()}`;

      // Navigate directly to video call page (it will handle Chime SDK setup)
      navigate(`/video-call/${appointmentId}`);

    } catch (error) {
      console.error('Error starting video call:', error);
      alert('Failed to start video call: ' + error.message);
    }
  };

  return (
    <HealthcareDashboard
      onNavigateToCalendar={() => navigate('/calendar')}
      onStartVideoCall={handleVideoCallStart}
    />
  );
};

// Enhanced Calendar Wrapper
const CalendarWrapper = () => {
  const navigate = useNavigate();

  const handleJoinVideoCall = (appointmentId) => {
    navigate(`/video-call/${appointmentId}`);
  };

  return (
    <CalendarPage
      onNavigateToNewAppointment={() => navigate('/appointments/new')}
      onJoinVideoCall={handleJoinVideoCall}
    />
  );
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

          {/* Patient Video Call Join (Public for easy patient access) */}
          <Route path="/join/:appointmentId" element={<VideoCallPage mode="patient" />} />

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

          {/* Video Call Routes */}
          <Route path="/video-call/:appointmentId" element={
            <ProtectedRoute>
              <VideoCallPage mode="provider" />
            </ProtectedRoute>
          } />

          {/* Catch all route - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;