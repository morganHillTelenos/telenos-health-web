import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import './styles/globals.css';

// Import components
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import HealthcareDashboard from './pages/HealthcareDashboard';
import PatientsPage from './pages/PatientsPage';
import NewPatientForm from './pages/NewPatientForm';
import CalendarPage from './pages/CalendarPage';
import VideoCallPage from './pages/VideoCallPage'; // Import the separate file
import Header from './components/Header';
import NewAppointmentPage from './pages/NewAppointmentPage';

// Import services
import { authService } from './services/auth';

// New Appointment Wrapper
const NewAppointmentWrapper = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleAppointmentCreated = (appointment) => {
    console.log('✅ Appointment created:', appointment);
    navigate('/calendar');
  };

  const handleCancel = () => {
    console.log('❌ Appointment creation cancelled');
    navigate('/calendar');
  };

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-6 py-8 pt-20">
          <div className="mb-8">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
            >
              <span className="text-lg">←</span>
              Back to Calendar
            </button>
          </div>
          <NewAppointmentPage
            onAppointmentCreated={handleAppointmentCreated}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  return children;
};

const LandingPageWrapper = () => {
  const navigate = useNavigate();

  // Temporarily comment this out to prevent auto-redirect
  /*
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);
  */

  return <LandingPage onEnterDashboard={() => navigate('/dashboard')} />;
};

const LoginPageWrapper = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState(null);

  // Temporarily comment this out too
  /*
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);
  */

  const handleLogin = async (user) => {
    try {
      console.log('🎯 App.js handleLogin called with user:', user);
      console.log('✅ Navigating to dashboard...');
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Navigation error:', error);
      setLoginError(error.message);
    }
  };

  return (
    <div>
      <LoginPage onLogin={handleLogin} />
      {loginError && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {loginError}
        </div>
      )}
    </div>
  );
};

// Dashboard Wrapper - Simplified with Proper Props
const DashboardWrapper = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleVideoCallStart = async (appointmentId) => {
    try {
      const id = appointmentId || `appointment-${Date.now()}`;
      console.log('🎥 Starting video call for appointment:', id);
      navigate(`/video-call/start/${id}`);
    } catch (error) {
      console.error('Error starting video call:', error);
      alert('Failed to start video call: ' + error.message);
    }
  };

  const handleNavigateToPatients = () => {
    console.log('🏥 Navigating to patients from dashboard...');
    navigate('/patients');
  };

  const handleNavigateToCalendar = () => {
    console.log('📅 Navigating to calendar from dashboard...');
    navigate('/calendar');
  };

  const handleNavigateToNewPatient = () => {
    console.log('👤 Navigating to new patient from dashboard...');
    navigate('/patients/new');
  };

  const handleNavigateToNewAppointment = () => {
    console.log('📅 Navigating to new appointment from dashboard...');
    navigate('/appointments/new');
  };

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <HealthcareDashboard
        onNavigateToCalendar={handleNavigateToCalendar}
        onNavigateToPatients={handleNavigateToPatients}
        onNavigateToNewPatient={handleNavigateToNewPatient}
        onNavigateToNewAppointment={handleNavigateToNewAppointment}
        onStartVideoCall={handleVideoCallStart}
      />
    </div>
  );
};

// Calendar Wrapper
const CalendarWrapper = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleJoinVideoCall = (appointmentId) => {
    console.log('🤝 Joining video call for appointment:', appointmentId);
    navigate(`/video-call/${appointmentId}`);
  };

  const handleStartVideoCall = (appointmentId) => {
    console.log('🎥 Starting video call for appointment:', appointmentId);
    navigate(`/video-call/start/${appointmentId}`);
  };

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <CalendarPage
        onJoinVideoCall={handleJoinVideoCall}
        onStartVideoCall={handleStartVideoCall}
      />
    </div>
  );
};

// Patients Wrapper
const PatientsWrapper = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleNavigateToNewPatient = () => {
    console.log('🏥 Navigating to new patient form...');
    console.log('Current URL:', window.location.pathname);
    console.log('Target URL: /patients/new');
    navigate('/patients/new');
  };

  const handleNavigateToPatient = (patientId) => {
    console.log('👤 Navigating to patient detail:', patientId);
    console.log('Current URL:', window.location.pathname);
    console.log('Target URL:', `/patients/${patientId}`);
    navigate(`/patients/${patientId}`);
  };

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <PatientsPage
        onNavigateToNewPatient={handleNavigateToNewPatient}
        onNavigateToPatient={handleNavigateToPatient}
      />
    </div>
  );
};

// New Patient Wrapper - Updated for Page instead of Modal
const NewPatientWrapper = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handlePatientCreated = (patient) => {
    console.log('✅ Patient created:', patient);
    navigate('/patients');
  };

  const handleCancel = () => {
    console.log('❌ Patient creation cancelled');
    navigate('/patients');
  };

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-6 py-8 pt-20">
          <div className="mb-8">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
            >
              <span className="text-lg">←</span>
              Back to Patients
            </button>
          </div>
          <NewPatientForm
            onPatientCreated={handlePatientCreated}
            onCancel={handleCancel}
            showCloseButton={false}
          />
        </div>
      </div>
    </div>
  );
};

// Patient Detail Wrapper
const PatientDetailWrapper = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Patient Details</h3>
                <p className="text-sm text-blue-800">
                  This would show detailed patient information for patient ID: {id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Video Call Wrapper - SIMPLIFIED
const VideoCallWrapper = () => {
  const location = useLocation();
  const isProviderStart = location.pathname.includes('/start/');

  console.log('🎬 Video call page loaded');
  console.log('- URL:', location.pathname);
  console.log('- Provider start:', isProviderStart);

  // Simply return the imported VideoCallPage component
  return <VideoCallPage />;
};

// Main App Component
const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPageWrapper />} />
          <Route path="/login" element={<LoginPageWrapper />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardWrapper />
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
            path="/patients/:id"
            element={
              <ProtectedRoute>
                <PatientDetailWrapper />
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

          {/* Video Call Routes */}
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

          {/* Catch all - redirect to login */}
          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;