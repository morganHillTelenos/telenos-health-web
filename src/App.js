// src/App.js - Updated with role-based routing and experiences
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

// Role-based Route Guards
const ProviderRoute = ({ children }) => {
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

  if (loading) return <LoadingSpinner />;

  // For Cognito users, we'll assume providers for now
  // You can add custom attributes to distinguish roles
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PatientRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      // Check if user has patient role attribute
      const userRole = currentUser.attributes?.['custom:role'] || 'patient';
      if (userRole === 'patient') {
        setUser(currentUser);
      }
    } catch (error) {
      console.log('Not authenticated or not a patient');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

// Public routes - no authentication required
const PublicRoute = ({ children }) => {
  return children;
};

// Simplified Protected Route Component - works with Cognito Authenticator wrapper
const ProtectedRoute = ({ children, requiredRole = null }) => {
  // Since you're using Authenticator wrapper, user is already authenticated when this renders
  // The user prop is passed down from your main App component
  return children;
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
  </div>
);

// Main App Component - Updated to handle role-based routing
function App({ signOut, user }) {
  // Helper function to create user object from Cognito user
  const getCognitoUser = () => {
    if (!user) return null;

    // Default to provider role if no custom role is set
    const userRole = user.attributes?.['custom:role'] || 'provider';
    return {
      username: user.username,
      email: user.signInDetails?.loginId || user.attributes?.email || user.username,
      userId: user.userId,
      name: user.attributes?.email || user.username,
      role: userRole,
      isProvider: userRole === 'provider',
      isPatient: userRole === 'patient'
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

  // Wrapper Components for Public Routes
  const LoginPageWrapper = () => {
    const navigate = useNavigate();
    const currentUser = getCognitoUser();

    // Redirect based on role if already authenticated
    if (currentUser) {
      const redirectPath = currentUser.isPatient ? '/patient-dashboard' : '/dashboard';
      return <Navigate to={redirectPath} replace />;
    }

    return <Navigate to="/dashboard" replace />; // Since user is authenticated
  };

  const LandingPageWrapper = () => {
    const navigate = useNavigate();
    const currentUser = getCognitoUser();

    const handleGetStarted = () => {
      if (currentUser) {
        const redirectPath = currentUser.isPatient ? '/patient-dashboard' : '/dashboard';
        navigate(redirectPath);
      } else {
        navigate('/dashboard');
      }
    };

    const handleLogin = () => {
      if (currentUser) {
        const redirectPath = currentUser.isPatient ? '/patient-dashboard' : '/dashboard';
        navigate(redirectPath);
      } else {
        navigate('/dashboard');
      }
    };

    return (
      <LandingPage
        onGetStarted={handleGetStarted}
        onLogin={handleLogin}
      />
    );
  };

  const LandingPagePatientWrapper = () => {
    const navigate = useNavigate();
    const currentUser = getCognitoUser();

    const handleGetStarted = () => {
      if (currentUser) {
        const redirectPath = currentUser.isPatient ? '/patient-dashboard' : '/dashboard';
        navigate(redirectPath);
      } else {
        navigate('/patient-dashboard');
      }
    };

    const handleLogin = () => {
      if (currentUser) {
        const redirectPath = currentUser.isPatient ? '/patient-dashboard' : '/dashboard';
        navigate(redirectPath);
      } else {
        navigate('/patient-dashboard');
      }
    };

    return (
      <LandingPatient
        onGetStarted={handleGetStarted}
        onLogin={handleLogin}
      />
    );
  };

  // Provider Dashboard Wrapper
  const ProviderDashboardWrapper = () => {
    const navigate = useNavigate();
    const currentUser = getCognitoUser();

    const handleVideoCallStart = async (appointmentId) => {
      try {
        const id = appointmentId || `appointment-${Date.now()}`;
        console.log('Starting video call for appointment:', id);
        navigate(`/video-call/start/${id}`);
      } catch (error) {
        console.error('Video call start error:', error);
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

  // Patient Dashboard Wrapper - Different experience for patients
  const PatientDashboardWrapper = () => {
    const navigate = useNavigate();
    const currentUser = getCognitoUser();

    return (
      <div>
        <Header user={currentUser} onLogout={handleLogout} />
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
          <div className="container mx-auto px-6 py-8 pt-20">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-800 mb-8">Patient Portal</h1>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Upcoming Appointments */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 text-blue-600">Upcoming Appointments</h2>
                  <div className="text-gray-600">
                    <p>No upcoming appointments scheduled.</p>
                    <button
                      className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                      onClick={() => navigate('/patient-appointments')}
                    >
                      Schedule Appointment
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 text-green-600">My Health Records</h2>
                  <div className="text-gray-600">
                    <p>Access your medical records and test results.</p>
                    <button
                      className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                      onClick={() => navigate('/patient-records')}
                    >
                      View Records
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 text-purple-600">Messages</h2>
                  <div className="text-gray-600">
                    <p>No new messages from your healthcare provider.</p>
                    <button
                      className="mt-4 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
                      onClick={() => navigate('/patient-messages')}
                    >
                      View Messages
                    </button>
                  </div>
                </div>

                {/* Video Calls */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 text-orange-600">Telemedicine</h2>
                  <div className="text-gray-600">
                    <p>Join video consultations with your doctor.</p>
                    <button
                      className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                      onClick={() => navigate('/patient-video-calls')}
                    >
                      Join Call
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Provider-specific wrappers (existing ones)
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

  const CalendarWrapper = () => {
    const navigate = useNavigate();
    const currentUser = getCognitoUser();

    const handleNewAppointment = () => {
      navigate('/appointments/new');
    };

    const handleJoinVideoCall = (appointmentId) => {
      console.log('Joining video call for appointment:', appointmentId);
      navigate(`/video-call/${appointmentId}`);
    };

    const handleStartVideoCall = (appointmentId) => {
      console.log('Starting video call for appointment:', appointmentId);
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
              onJoinVideoCall={handleJoinVideoCall}
              onStartVideoCall={handleStartVideoCall}
            />
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
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const currentUser = getCognitoUser();
    const location = useLocation();

    const isStartCall = location.pathname.includes('/start/');
    const isPatient = currentUser?.isPatient || false;

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
        userId: user.userId,
        role: user.attributes?.['custom:role'] || 'provider'
      });
    }
  }, [user]);

  return (
    <div className="App">
      <Routes>
        {/* Public Routes - No authentication required */}
        <Route path="/" element={<PublicRoute><LandingPageWrapper /></PublicRoute>} />
        <Route path="/home" element={<PublicRoute><LandingPagePatientWrapper /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPageWrapper /></PublicRoute>} />

        {/* Provider Routes - For now, allow all authenticated users */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ProviderDashboardWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <ProtectedRoute>
              <PatientsWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/new"
          element={
            <ProtectedRoute>
              <NewPatientWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/new"
          element={
            <ProtectedRoute>
              <NewAppointmentWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <NotesWrapper />
            </ProtectedRoute>
          }
        />

        {/* Patient Routes - For testing patient experience */}
        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute>
              <PatientDashboardWrapper />
            </ProtectedRoute>
          }
        />

        {/* Shared Video Call Routes - Both roles can access */}
        <Route
          path="/video-call/start/:appointmentId"
          element={
            <ProtectedRoute>
              <VideoCallWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video-call/:appointmentId"
          element={
            <ProtectedRoute>
              <VideoCallWrapper />
            </ProtectedRoute>
          }
        />

        {/* Patient Video Call Routes - NO AUTHENTICATION REQUIRED */}
        <Route path="/join/:appointmentId" element={<PatientVideoCallWrapper />} />
        <Route path="/join/:appointmentId/:patientToken" element={<PatientVideoCallWrapper />} />

        {/* Catch all for unknown routes - redirect based on authentication */}
        <Route
          path="*"
          element={
            user ? (
              <Navigate
                to={user.attributes?.['custom:role'] === 'patient' ? '/patient-dashboard' : '/dashboard'}
                replace
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;