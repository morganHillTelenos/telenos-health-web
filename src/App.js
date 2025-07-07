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
import VideoCallPage from './pages/VideoCallPage';
import ProviderNotesPage from './pages/ProviderNotesPage'; // New import
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

// Provider Notes Wrapper
const ProviderNotesWrapper = () => {
  return <ProviderNotesPage />;
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

  return <LandingPage onEnterDashboard={() => navigate('/dashboard')} />;
};

const LoginPageWrapper = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState(null);

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
      console.error('❌ Video call start error:', error);
    }
  };

  const handleNavigateToPatients = () => {
    navigate('/patients');
  };

  const handleNavigateToCalendar = () => {
    navigate('/calendar');
  };

  const handleNavigateToNotes = () => {
    navigate('/notes');
  };

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <div className="pt-20">
        <HealthcareDashboard
          onVideoCallStart={handleVideoCallStart}
          onNavigateToPatients={handleNavigateToPatients}
          onNavigateToCalendar={handleNavigateToCalendar}
          onNavigateToNotes={handleNavigateToNotes}
        />
      </div>
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

  const handleNavigateToPatient = (patientId) => {
    navigate(`/patients/${patientId}`);
  };

  const handleNavigateToNewPatient = () => {
    navigate('/patients/new');
  };

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <div className="pt-20">
        <PatientsPage
          onNavigateToPatient={handleNavigateToPatient}
          onNavigateToNewPatient={handleNavigateToNewPatient}
        />
      </div>
    </div>
  );
};

// New Patient Wrapper
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
    navigate('/patients');
  };

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <div className="pt-20">
        <NewPatientForm
          onPatientCreated={handlePatientCreated}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

// Patient Detail Wrapper
const PatientDetailWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Patient Detail View</h2>
        <p className="mb-4">Patient ID: {id}</p>
        <button
          onClick={() => navigate('/patients')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Patients
        </button>
      </div>
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

  const handleNewAppointment = () => {
    navigate('/appointments/new');
  };

  const handleVideoCallStart = (appointmentId) => {
    navigate(`/video-call/start/${appointmentId}`);
  };

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <div className="pt-20">
        <CalendarPage
          onNewAppointment={handleNewAppointment}
          onVideoCallStart={handleVideoCallStart}
        />
      </div>
    </div>
  );
};

// Video Call Wrapper (Provider)
const VideoCallWrapper = () => {
  const location = useLocation();
  const isProviderStart = location.pathname.includes('/start/');

  console.log('🎬 Video call page loaded');
  console.log('- URL:', location.pathname);
  console.log('- Provider start:', isProviderStart);

  return <VideoCallPage />;
};

// Patient Video Call Wrapper (No authentication required)
const PatientVideoCallWrapper = () => {
  const location = useLocation();
  const { appointmentId, patientToken } = useParams();

  console.log('👤 Patient video call page loaded');
  console.log('- URL:', location.pathname);
  console.log('- Appointment ID:', appointmentId);
  console.log('- Patient Token:', patientToken);

  return <VideoCallPage isPatient={true} />;
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
          <Route path="/dashboard" element={<ProtectedRoute><DashboardWrapper /></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute><PatientsWrapper /></ProtectedRoute>} />
          <Route path="/patients/new" element={<ProtectedRoute><NewPatientWrapper /></ProtectedRoute>} />
          <Route path="/patients/:id" element={<ProtectedRoute><PatientDetailWrapper /></ProtectedRoute>} />
          <Route path="/appointments/new" element={<ProtectedRoute><NewAppointmentWrapper /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarWrapper /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><ProviderNotesWrapper /></ProtectedRoute>} />

          {/* Video Call Routes */}
          <Route path="/video-call/start/:appointmentId" element={<ProtectedRoute><VideoCallWrapper /></ProtectedRoute>} />
          <Route path="/video-call/:appointmentId" element={<ProtectedRoute><VideoCallWrapper /></ProtectedRoute>} />

          {/* Patient Video Call Routes - NO AUTHENTICATION REQUIRED */}
          <Route path="/join/:appointmentId" element={<PatientVideoCallWrapper />} />
          <Route path="/join/:appointmentId/:patientToken" element={<PatientVideoCallWrapper />} />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;