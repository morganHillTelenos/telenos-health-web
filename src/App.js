import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HealthcareDashboard from './pages/HealthcareDashboard';
import CalendarPage from './pages/CalendarPage';
import NewAppointmentPage from './pages/NewAppointmentPage';
import PatientsPage from './pages/PatientsPage';

// Import the patient detail component from the artifacts
// You'll need to create this as a separate file: src/pages/PatientDetailPage.js
// import PatientDetailPage from './pages/PatientDetailPage';

// For now, we'll create a simple patient detail component inline
const PatientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // This would normally be imported from your patient detail artifact
  // For now, just showing a simple page
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
            <p className="text-gray-600">Patient ID: {id}</p>
            <p className="text-sm text-gray-500 mt-4">
              Replace this component with your PatientDetailPage artifact by creating:
              <br />
              <code className="bg-gray-100 px-2 py-1 rounded">src/pages/PatientDetailPage.js</code>
            </p>
          </div>
        </div>
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
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg ${window.location.pathname.startsWith('/patients')
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

// New Patient Page Placeholder
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
            <div className="mt-6">
              <button
                onClick={() => navigate('/patients')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Patient (Demo)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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

          <Route path="/patients" element={
            <>
              <Navigation />
              <PatientsWrapper />
            </>
          } />

          <Route path="/patients/new" element={
            <>
              <Navigation />
              <NewPatientPage />
            </>
          } />

          <Route path="/patients/:id" element={
            <>
              <Navigation />
              <PatientDetailPage />
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